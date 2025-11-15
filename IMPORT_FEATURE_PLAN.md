# Bank Statement Import Feature - Implementation Plan

## Overview

Implement smart auto-detection with override for importing bank statements from CSV/XLSX files with custom column mappings.

## Architecture

- **Backend**: ASP.NET Core + HotChocolate GraphQL + EF Core
- **Frontend**: Angular 20 + Apollo Angular + Material UI
- **File Parsing**: CsvHelper (CSV) + EPPlus (XLSX)
- **Detection**: Fuzzy matching with multi-language support

---

## Phase 1: Backend Foundation

### Step 1: Create BankImportTemplate Domain Model

**File**: `PhantomDave.BankTracking.Library/Models/BankImportTemplate.cs`

```csharp
public class BankImportTemplate
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string BankName { get; set; } = string.Empty;
    public Dictionary<string, string> ColumnMappings { get; set; } = new(); // "Date" -> "Data operazione"
    public string DateFormat { get; set; } = "dd/MM/yyyy";
    public string DecimalSeparator { get; set; } = ".";
    public string ThousandsSeparator { get; set; } = ",";
    public bool IsDefault { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
```

**Dependencies**: `PhantomDave.BankTracking.Library.csproj`

---

### Step 2: Add EF Core Configuration

**File**: `PhantomDave.BankTracking.Data/BankTrackerDbContext.cs`

- Add `DbSet<BankImportTemplate> BankImportTemplates`
- Configure `ColumnMappings` as JSON column using `.HasConversion()` or `.OwnsOne()`
- Run migration: `dotnet ef migrations add AddBankImportTemplate`

**Dependencies**: EF Core, PostgreSQL provider

---

### Step 3: Create Column Detection Service

**File**: `PhantomDave.BankTracking.Api/Services/ColumnDetectionService.cs`

**Purpose**: Fuzzy match column headers to known patterns

**Key Features**:

- Multi-language pattern matching (English, Italian, Spanish, German)
- Confidence scoring (0-100%)
- Support for common bank column names:
  - Date: "date", "data", "fecha", "datum", "transaction date", "valuta"
  - Amount: "amount", "importo", "monto", "betrag", "addebito", "accredito"
  - Description: "description", "descrizione", "memo", "details", "causale"
  - Balance: "balance", "saldo", "saldo contabile"

**Methods**:

```csharp
public Dictionary<string, ColumnDetectionResult> DetectColumns(string[] headers)
public int CalculateConfidence(string header, string[] patterns)
```

**Dependencies**: None (pure logic)

---

### Step 4: Create File Parsing Service

**File**: `PhantomDave.BankTracking.Api/Services/FileImportService.cs`

**Purpose**: Parse CSV/XLSX files and extract data

**Key Features**:

- Auto-detect CSV delimiter (comma, semicolon, tab, pipe)
- Auto-detect encoding (UTF-8, Windows-1252, ISO-8859-1)
- Handle XLSX with multiple sheets (use first data sheet)
- Skip header rows
- Parse dates with custom formats
- Handle different decimal separators

**Methods**:

```csharp
public Task<ParsedFileData> ParseFileAsync(IFile file)
public Task<List<Dictionary<string, string>>> ParseCsvAsync(Stream stream)
public Task<List<Dictionary<string, string>>> ParseXlsxAsync(Stream stream)
public string DetectDelimiter(string sampleText)
public Encoding DetectEncoding(Stream stream)
```

**Example ParsedFileData class**:

```csharp
public class ParsedFileData
{
    public List<string> Headers { get; set; } = new();
    public List<Dictionary<string, string>> Rows { get; set; } = new();
    public int TotalRows { get; set; }
    public string DetectedDelimiter { get; set; } = ",";
    public string DetectedEncoding { get; set; } = "UTF-8";
    public string FileType { get; set; } = "CSV"; // "CSV" or "XLSX"
}
```

**Dependencies**: CsvHelper, EPPlus

---

### Step 5: Add NuGet Packages

**File**: `PhantomDave.BankTracking.Api/PhantomDave.BankTracking.Api.csproj`

```bash
dotnet add package CsvHelper
dotnet add package EPPlus
dotnet add package HotChocolate.AspNetCore.Authorization
```

**Verify**: Check if HotChocolate supports file uploads (should be included)

---

## Phase 2: GraphQL Layer

### Step 6: Create GraphQL Input Types

**Files**:

- `PhantomDave.BankTracking.Api/Types/Inputs/PreviewImportInput.cs`
- `PhantomDave.BankTracking.Api/Types/Inputs/ConfirmImportInput.cs`
- `PhantomDave.BankTracking.Api/Types/Inputs/ImportTemplateInput.cs`

**PreviewImportInput**:

```csharp
public class PreviewImportInput
{
    public IFile File { get; set; }
    public int? TemplateId { get; set; } // Optional: use existing template
}
```

**ConfirmImportInput**:

```csharp
public class ConfirmImportInput
{
    public IFile File { get; set; }
    public Dictionary<string, string> ColumnMappings { get; set; }
    public string DateFormat { get; set; }
    public string DecimalSeparator { get; set; }
    public string ThousandsSeparator { get; set; }
    public int RowsToSkip { get; set; } = 0;
    public bool SaveAsTemplate { get; set; } = false;
    public string? TemplateName { get; set; }
}
```

---

### Step 7: Create GraphQL Object Types

**Files**:

- `PhantomDave.BankTracking.Api/Types/ObjectTypes/ImportPreviewType.cs`
- `PhantomDave.BankTracking.Api/Types/ObjectTypes/ImportResultType.cs`
- `PhantomDave.BankTracking.Api/Types/ObjectTypes/BankImportTemplateType.cs`

**ImportPreviewType**:

```csharp
public class ImportPreviewType
{
    public Dictionary<string, ColumnDetectionResult> DetectedColumns { get; set; }
    public List<Dictionary<string, string>> SampleRows { get; set; } // First 10 rows
    public int TotalRows { get; set; }
    public List<string> Headers { get; set; }
}

public class ColumnDetectionResult
{
    public string SuggestedMapping { get; set; } // "Date", "Amount", etc.
    public int Confidence { get; set; } // 0-100
    public string ColumnName { get; set; }
}
```

**ImportResultType**:

```csharp
public class ImportResultType
{
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public int DuplicateCount { get; set; }
    public List<ImportError> Errors { get; set; }
    public List<FinanceRecordType> CreatedRecords { get; set; }
}

public class ImportError
{
    public int RowNumber { get; set; }
    public string Message { get; set; }
    public Dictionary<string, string> RowData { get; set; }
}
```

---

### Step 8: Create Import Mutations

**File**: `PhantomDave.BankTracking.Api/Types/Mutations/ImportMutations.cs`

```csharp
[ExtendObjectType(OperationTypeNames.Mutation)]
public class ImportMutations
{
    [Authorize]
    public async Task<ImportPreviewType> PreviewImport(
        PreviewImportInput input,
        [Service] FileImportService fileService,
        [Service] ColumnDetectionService detectionService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        // Parse file, detect columns, return first 10 rows
    }

    [Authorize]
    public async Task<ImportResultType> ConfirmImport(
        ConfirmImportInput input,
        [Service] FileImportService fileService,
        [Service] FinanceRecordService financeService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        // Parse file with user mappings, validate, bulk create records
    }
}
```

**Error Codes**:

- `FILE_UPLOAD_FAILED`
- `INVALID_FILE_FORMAT`
- `PARSE_ERROR`
- `VALIDATION_ERROR`
- `DUPLICATE_DETECTED`

---

### Step 9: Add Template Management Mutations

**File**: `PhantomDave.BankTracking.Api/Types/Mutations/ImportMutations.cs` (extend)

```csharp
[Authorize]
public async Task<BankImportTemplateType> CreateImportTemplate(
    string bankName,
    Dictionary<string, string> columnMappings,
    string dateFormat,
    string decimalSeparator,
    string thousandsSeparator,
    bool isDefault,
    [Service] ImportTemplateService templateService,
    [Service] IHttpContextAccessor httpContextAccessor)

[Authorize]
public async Task<BankImportTemplateType> UpdateImportTemplate(...)

[Authorize]
public async Task<bool> DeleteImportTemplate(int id, ...)
```

**Query**:

```csharp
[ExtendObjectType(OperationTypeNames.Query)]
public class ImportQueries
{
    [Authorize]
    public async Task<List<BankImportTemplateType>> GetImportTemplates(
        [Service] ImportTemplateService templateService,
        [Service] IHttpContextAccessor httpContextAccessor)
}
```

---

### Step 10: Implement Duplicate Detection

**File**: `PhantomDave.BankTracking.Api/Services/FinanceRecordService.cs` (extend)

```csharp
public async Task<List<FinanceRecord>> FindDuplicatesAsync(
    int accountId,
    List<FinanceRecord> candidates)
{
    // Match by Date + Amount + Description (case-insensitive, trimmed)
    // Return list of existing duplicates
}

public async Task<ImportResultType> BulkCreateWithDuplicateCheckAsync(
    int accountId,
    List<FinanceRecord> records)
{
    // Skip duplicates, create new ones, return detailed result
}
```

**Logic**:

- Normalize descriptions (trim, lowercase)
- Match on exact Date + exact Amount + similar Description (Levenshtein distance < 3)
- Option to merge duplicates or skip

---

## Phase 3: Frontend Structure

### Step 11: Create Angular Import Wizard Component

**Directory**: `frontend/src/app/components/import-wizard/`

**Files**:

- `import-wizard.component.ts`
- `import-wizard.component.html`
- `import-wizard.component.css`
- `steps/step1-upload.component.ts`
- `steps/step2-detect.component.ts`
- `steps/step3-configure.component.ts`
- `steps/step4-preview.component.ts`
- `steps/step5-confirm.component.ts`

**Structure**:

```typescript
@Component({
  selector: 'app-import-wizard',
  imports: [MatStepperModule, CommonModule, ...stepComponents],
  standalone: true,
})
export class ImportWizardComponent {
  protected readonly importService = inject(ImportService);
  protected stepper!: MatStepper;
}
```

---

### Step 12: Create GraphQL Operations

**Directory**: `frontend/src/app/models/import/gql/`

**Files**:

- `preview-import.mutation.graphql`
- `confirm-import.mutation.graphql`
- `get-import-templates.query.graphql`
- `create-import-template.mutation.graphql`
- `update-import-template.mutation.graphql`
- `delete-import-template.mutation.graphql`

**Example** (`preview-import.mutation.graphql`):

```graphql
mutation PreviewImport($file: Upload!) {
  previewImport(input: { file: $file }) {
    detectedColumns {
      columnName
      suggestedMapping
      confidence
    }
    sampleRows
    totalRows
    headers
  }
}
```

**Run**: `npm run codegen` to generate TypeScript types

---

### Step 13: Create ImportService

**File**: `frontend/src/app/models/import/import-service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly previewImportGQL = inject(PreviewImportGQL);
  private readonly confirmImportGQL = inject(ConfirmImportGQL);
  private readonly snackbar = inject(SnackbarService);

  // State signals
  private readonly _preview = signal<ImportPreview | null>(null);
  private readonly _result = signal<ImportResult | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  public readonly preview = this._preview.asReadonly();
  public readonly result = this._result.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  async previewFile(file: File): Promise<boolean> {
    /* ... */
  }
  async confirmImport(mappings: ColumnMappings): Promise<boolean> {
    /* ... */
  }
  validateFile(file: File): string | null {
    /* ... */
  }
}
```

---

## Phase 4: UI Implementation

### Step 14: Build File Upload Step

**Component**: `step1-upload.component.ts`

**Features**:

- Drag-drop zone (Material `<input type="file">` with custom styling)
- File type validation: `.csv`, `.xlsx`, `.xls`
- Max size validation: 10MB
- Preview first 10 rows in Material table
- Load template button (opens dialog)

**Libraries**: `@angular/material/button`, `@angular/material/table`

---

### Step 15: Build Column Mapping Step

**Component**: `step2-detect.component.ts`

**Features**:

- Show detected columns in Material table with:
  - Column name
  - Suggested mapping (dropdown: Date, Amount, Description, Name, Skip)
  - Confidence badge (green >80%, yellow 50-80%, red <50%)
- Allow manual override via dropdowns
- Highlight required fields (Date, Amount)

**UI**:

```
| Column Name       | Detected As | Confidence | Action     |
|-------------------|-------------|------------|------------|
| Data operazione   | Date        | 95%        | [Dropdown] |
| Importo           | Amount      | 90%        | [Dropdown] |
| Causale           | Description | 85%        | [Dropdown] |
```

---

### Step 16: Build Parsing Configuration Step

**Component**: `step3-configure.component.ts`

**Features**:

- Date format input with presets:
  - `dd/MM/yyyy` (Italian)
  - `MM/dd/yyyy` (US)
  - `yyyy-MM-dd` (ISO)
  - Custom input
- Decimal separator radio buttons: `.` or `,`
- Thousands separator radio buttons: `,`, `.`, or space
- Rows to skip input (number)
- Save as template checkbox + template name input

---

### Step 17: Build Preview Step

**Component**: `step4-preview.component.ts`

**Features**:

- Material table showing parsed finance records
- Inline editing (Material `contenteditable` cells)
- Validation indicators:
  - ⚠️ Duplicate warning (yellow row)
  - ❌ Invalid date/amount (red text)
  - ✓ Valid (green checkmark)
- Filter options: Show all / Show errors only / Show duplicates only
- Summary: "X valid, Y duplicates, Z errors"

**Columns**: Date, Amount, Currency, Description, Name, Status

---

### Step 18: Build Confirmation Step

**Component**: `step5-confirm.component.ts`

**Features**:

- Summary card: "Ready to import X records"
- Progress bar during import (indeterminate)
- Success result:
  - "✓ Successfully imported X records"
  - "⚠️ Skipped Y duplicates"
  - "❌ Failed Z records"
- Error list (expandable accordion)
- Actions: "View Records", "Import More", "Close"

---

## Phase 5: Polish & Integration

### Step 19: Add Template Management UI

**Component**: `template-manager-dialog.component.ts`

**Features**:

- Material dialog with list of saved templates
- Actions per template:
  - Edit (opens edit dialog)
  - Delete (with confirmation)
  - Set as default (radio button)
- Create new template button
- Used in Step 1 (load template) and Step 3 (save template)

---

### Step 20: Add Navigation and Integration

**Tasks**:

1. Add "Import" button to finance records page toolbar
2. Add route: `/home/import` → `ImportWizardComponent`
3. Update `schema.graphql` by running backend
4. Run `npm run codegen` to generate types
5. Test end-to-end:
   - Upload CSV from Intesa Sanpaolo
   - Verify column detection
   - Override incorrect mappings
   - Preview and edit records
   - Confirm import
   - Verify records appear in finance list
6. Test error scenarios:
   - Invalid file format
   - Missing required columns
   - Duplicate records
   - Invalid dates/amounts

---

## Testing Checklist

### Backend

- [x] BankImportTemplate CRUD operations
- [x] Column detection accuracy (test with real bank files)
- [x] CSV parsing with different delimiters
- [x] XLSX parsing with multiple sheets
- [x] Duplicate detection logic
- [x] Bulk insert performance (1000+ records)
- [x] Error handling for malformed files

### Frontend

- [x] File upload validation
- [x] Column mapping override
- [x] Date format preview
- [x] Inline editing in preview
- [ ] Template save/load
- [x] Navigation flow (all 5 steps)
- [x] Error display (snackbar + inline)
- [x] Responsive layout (mobile/desktop)

---

## Future Enhancements

1. **Background processing**: For large files (>5000 rows), use job queue
2. **Template sharing**: Share templates across accounts
3. **AI-powered detection**: Use ML to improve column detection
4. **Transaction categorization**: Auto-tag transactions during import
5. **Multi-account import**: Import to multiple accounts at once
6. **Scheduled imports**: Auto-import from email attachments
7. **Bank API integration**: Direct import via Open Banking APIs

---

## Dependencies Summary

### Backend NuGet Packages

- `CsvHelper` - CSV parsing
- `EPPlus` - XLSX parsing
- `HotChocolate.AspNetCore` - File upload support

### Frontend NPM Packages

(Already included in Angular Material)

- `@angular/material/stepper`
- `@angular/material/table`
- `@apollo/client` (for file upload)

---

## Estimated Effort

- **Phase 1**: 8-12 hours
- **Phase 2**: 8-10 hours
- **Phase 3**: 4-6 hours
- **Phase 4**: 16-20 hours
- **Phase 5**: 6-8 hours
- **Total**: 42-56 hours (5-7 working days)

---

## Notes

- Keep Italian UI messages (as per existing codebase pattern)
- Follow existing error code conventions (`BAD_USER_INPUT`, `UNAUTHENTICATED`)
- Use signals throughout (no RxJS state management)
- Maintain ASCII in code, UTF-8 in UI strings
- Follow DRY and YAGNI principles
