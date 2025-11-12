# BankTracker TODO & Feature Ideas

## 🎯 High Priority Features

### Budgeting & Goals
- [ ] **Monthly Budget Tracking** - Set budget limits per category and track spending against them
- [ ] **Savings Goals** - Define financial goals (e.g., "Save $5000 for vacation") with progress tracking
- [ ] **Category-based Spending Limits** - Alert when approaching or exceeding category budgets
- [ ] **Budget vs Actual Reports** - Visual comparison of planned vs actual spending

### Data Management
- [ ] **CSV Import/Export** - Import transactions from bank statements, export data for backup or analysis **In Progress**
- [ ] **Bulk Operations** - Edit/delete multiple finance records at once
- [ ] **Data Backup/Restore** - Easy backup and restore functionality
- [ ] **Duplicate Detection** - Automatically flag potential duplicate transactions

### Analytics & Insights
- [ ] **Spending Trends Dashboard** - Charts showing spending patterns over time
- [ ] **Category Breakdown** - Pie/donut charts showing expense distribution by category
- [ ] **Month-over-Month Comparison** - Compare spending across different months
- [ ] **Year-end Financial Summary** - Comprehensive annual report
- [ ] **Cash Flow Analysis** - Income vs expenses timeline visualization

## 💡 Medium Priority Features

### Smart Features
- [ ] **AI Spending Insights** - Simple AI-generated summaries of spending habits
- [ ] **Predictive Balance** - Forecast future balance based on recurring transactions
- [ ] **Smart Categorization** - Auto-suggest categories based on description patterns
- [ ] **Spending Alerts** - Configurable notifications for unusual spending or budget breaches
- [ ] **Bill Reminders** - Notifications for upcoming recurring expenses

### User Experience
- [ ] **Search & Filters** - Advanced filtering by date range, category, amount, description
- [ ] **Tags System** - Add custom tags to transactions for flexible organization
- [ ] **Notes/Attachments** - Add notes or attach receipts to transactions
- [ ] **Quick Actions** - Fast-add frequently used transaction types
- [ ] **Keyboard Shortcuts** - Power-user shortcuts for common operations

### Multi-Account
- [ ] **Multiple Bank Accounts** - Track multiple accounts separately
- [ ] **Account Transfers** - Record transfers between accounts without double-counting
- [ ] **Account Reconciliation** - Match recorded transactions with actual bank statements
- [ ] **Net Worth Tracking** - Overall financial position across all accounts

## 🚀 Nice-to-Have Features

### Mobile & Accessibility
- [ ] **PWA Support** - Install as mobile app with offline capabilities
- [ ] **Offline Mode** - Cache recent records for offline viewing
- [ ] **Dark/Light Theme Toggle** - User-selectable themes
- [ ] **Custom Theme Colors** - Personalize the color scheme
- [ ] **Mobile-optimized UI** - Better touch interactions and responsive layouts

### Reporting
- [ ] **PDF Reports** - Generate downloadable monthly/yearly reports
- [ ] **Tax Category Tagging** - Tag transactions for tax purposes
- [ ] **Custom Report Builder** - Create and save custom report configurations
- [ ] **Email Reports** - Scheduled email summaries

### Advanced Features
- [ ] **Multi-currency Support** - Track accounts in different currencies with conversion
- [ ] **Investment Tracking** - Basic stock/investment portfolio tracking
- [ ] **Debt Payoff Calculator** - Track loans and calculate payoff schedules
- [ ] **Split Transactions** - Divide a single transaction across multiple categories
- [ ] **Shared Accounts** - Multiple users accessing the same account (family budgeting)

### Integrations
- [ ] **Bank API Integration** - Auto-import transactions from banks (if available)
- [ ] **Calendar Integration** - View recurring expenses on a calendar
- [ ] **Google Sheets Export** - Push data to Google Sheets for custom analysis
- [ ] **Webhook Notifications** - Send alerts to other services (Slack, Discord, etc.)

## 🔧 Technical Improvements

### Performance
- [ ] **Pagination Optimization** - Better handling of large datasets
- [ ] **Lazy Loading** - Load data on-demand for faster initial page load
- [ ] **Caching Strategy** - Reduce redundant API calls
- [ ] **Database Indexing** - Optimize query performance

### Security & Reliability
- [ ] **Two-Factor Authentication** - Enhanced account security
- [ ] **Session Management** - Better token refresh and timeout handling
- [ ] **Audit Log** - Track all changes to financial records
- [ ] **Automated Backups** - Scheduled database backups
- [ ] **Rate Limiting** - Protect API from abuse

### Developer Experience
- [ ] **Automated Tests** - Unit and integration tests for critical flows
- [ ] **API Documentation** - Swagger/GraphQL playground improvements
- [ ] **Error Logging** - Better error tracking and reporting
- [ ] **Performance Monitoring** - Track application performance metrics

## 📱 UI/UX Enhancements

- [ ] **Dashboard Widgets** - Customizable dashboard with draggable widgets
- [ ] **Quick Stats** - Summary cards showing key metrics (total spent this month, biggest expense, etc.)
- [ ] **Transaction Timeline** - Visual timeline view of transactions
- [ ] **Color-coded Categories** - Visual distinction between expense categories
- [ ] **Interactive Charts** - Click-through from charts to detailed transaction lists
- [ ] **Undo/Redo** - Quick undo for accidental edits/deletions
- [ ] **Batch Edit Mode** - Select multiple records and apply bulk changes
- [ ] **Favorite Transactions** - Save common transaction templates for quick entry

## 🎨 Quality of Life

- [ ] **Transaction Templates** - Save and reuse common transaction patterns
- [ ] **Smart Defaults** - Remember last-used values for faster data entry
- [ ] **Keyboard Navigation** - Full keyboard support for accessibility
- [ ] **Tooltips & Help** - Contextual help throughout the app
- [ ] **Onboarding Tour** - Guide new users through key features
- [ ] **Settings Panel** - User preferences (date format, currency symbol, default view)
- [ ] **Data Retention Policies** - Auto-archive old transactions

## 🐛 Known Issues & Tech Debt

- [ ] Fix Italian snackbar messages - translate to English
- [ ] Add automated test coverage
- [ ] Standardize error handling across all mutations
- [ ] Review and optimize database migrations
- [ ] Improve GraphQL error codes consistency

---

## Priority Legend
- 🎯 High Priority - Core features that significantly improve daily use
- 💡 Medium Priority - Nice improvements that add value
- 🚀 Nice-to-Have - Features for future consideration

## Implementation Notes
- Focus on features that solve real pain points in your daily financial tracking
- Keep the UI simple - avoid feature bloat
- Consider data privacy - all data should remain local/self-hosted
- Maintain the clean architecture - follow existing patterns
