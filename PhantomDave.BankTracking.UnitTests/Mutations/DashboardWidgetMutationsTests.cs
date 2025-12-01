using HotChocolate;
using Microsoft.AspNetCore.Http;
using Moq;
using PhantomDave.BankTracking.Api.Types.Inputs;
using PhantomDave.BankTracking.Api.Types.Mutations;
using PhantomDave.BankTracking.Data.Repositories;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;
using System.Security.Claims;

namespace PhantomDave.BankTracking.UnitTests.Mutations;

public class DashboardWidgetMutationsTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Dashboard>> _mockDashboardRepository;
    private readonly Mock<IRepository<DashboardWidget>> _mockWidgetRepository;
    private readonly Mock<IRepository<Account>> _mockAccountRepository;
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly DashboardWidgetMutations _mutations;

    public DashboardWidgetMutationsTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockDashboardRepository = new Mock<IRepository<Dashboard>>();
        _mockWidgetRepository = new Mock<IRepository<DashboardWidget>>();
        _mockAccountRepository = new Mock<IRepository<Account>>();
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

        _mockUnitOfWork.Setup(u => u.Dashboards).Returns(_mockDashboardRepository.Object);
        _mockUnitOfWork.Setup(u => u.DashboardWidgets).Returns(_mockWidgetRepository.Object);
        _mockUnitOfWork.Setup(u => u.Accounts).Returns(_mockAccountRepository.Object);

        _mutations = new DashboardWidgetMutations();

        // Setup a default authenticated context
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "1") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = claimsPrincipal };
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
    }

    [Fact]
    public async Task AddWidget_WithTitle_TrimsAndStoresTitle()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var account = new Account { Id = 1 };
        DashboardWidget? capturedWidget = null;

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository
            .Setup(r => r.AddAsync(It.IsAny<DashboardWidget>()))
            .Callback<DashboardWidget>(w => capturedWidget = w)
            .ReturnsAsync((DashboardWidget w) => w);

        var input = new AddWidgetInput
        {
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2,
            Title = "  Test Title  ",
            Subtitle = null,
            Config = null
        };

        // Act
        var result = await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedWidget);
        Assert.Equal("Test Title", capturedWidget.Title);
        Assert.Equal("Test Title", result.Title);
    }

    [Fact]
    public async Task AddWidget_WithSubtitle_TrimsAndStoresSubtitle()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var account = new Account { Id = 1 };
        DashboardWidget? capturedWidget = null;

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository
            .Setup(r => r.AddAsync(It.IsAny<DashboardWidget>()))
            .Callback<DashboardWidget>(w => capturedWidget = w)
            .ReturnsAsync((DashboardWidget w) => w);

        var input = new AddWidgetInput
        {
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2,
            Title = null,
            Subtitle = "  Test Subtitle  ",
            Config = null
        };

        // Act
        var result = await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedWidget);
        Assert.Equal("Test Subtitle", capturedWidget.Subtitle);
        Assert.Equal("Test Subtitle", result.Subtitle);
    }

    [Fact]
    public async Task AddWidget_WithConfig_StoresConfig()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var account = new Account { Id = 1 };
        DashboardWidget? capturedWidget = null;
        var configJson = "{\"from\":\"2024-01-01\",\"to\":\"2024-12-31\"}";

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository
            .Setup(r => r.AddAsync(It.IsAny<DashboardWidget>()))
            .Callback<DashboardWidget>(w => capturedWidget = w)
            .ReturnsAsync((DashboardWidget w) => w);

        var input = new AddWidgetInput
        {
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2,
            Title = null,
            Subtitle = null,
            Config = configJson
        };

        // Act
        var result = await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedWidget);
        Assert.Equal(configJson, capturedWidget.Config);
        Assert.Equal(configJson, result.Config);
    }

    [Fact]
    public async Task AddWidget_WithAllMetadata_StoresAllFields()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var account = new Account { Id = 1 };
        DashboardWidget? capturedWidget = null;
        var configJson = "{\"showCurrency\":true}";

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository
            .Setup(r => r.AddAsync(It.IsAny<DashboardWidget>()))
            .Callback<DashboardWidget>(w => capturedWidget = w)
            .ReturnsAsync((DashboardWidget w) => w);

        var input = new AddWidgetInput
        {
            DashboardId = 1,
            Type = WidgetType.CurrentBalance,
            X = 0,
            Y = 0,
            Rows = 1,
            Cols = 1,
            Title = "  My Balance  ",
            Subtitle = "  Current Account  ",
            Config = configJson
        };

        // Act
        var result = await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedWidget);
        Assert.Equal("My Balance", capturedWidget.Title);
        Assert.Equal("Current Account", capturedWidget.Subtitle);
        Assert.Equal(configJson, capturedWidget.Config);
        Assert.Equal("My Balance", result.Title);
        Assert.Equal("Current Account", result.Subtitle);
        Assert.Equal(configJson, result.Config);
    }

    [Fact]
    public async Task UpdateWidget_WithTitle_TrimsAndUpdatesTitle()
    {
        // Arrange
        var account = new Account { Id = 1 };
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var widget = new DashboardWidget
        {
            Id = 1,
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2
        };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(widget);
        _mockWidgetRepository.Setup(r => r.UpdateAsync(It.IsAny<DashboardWidget>()))
            .ReturnsAsync((DashboardWidget w) => w);

        var input = new UpdateWidgetInput
        {
            Id = 1,
            Title = "  Updated Title  "
        };

        // Act
        var result = await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.Equal("Updated Title", widget.Title);
        Assert.Equal("Updated Title", result.Title);
    }

    [Fact]
    public async Task UpdateWidget_WithEmptyTitle_ThrowsException()
    {
        // Arrange
        var account = new Account { Id = 1 };
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var widget = new DashboardWidget
        {
            Id = 1,
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2
        };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(widget);

        var input = new UpdateWidgetInput
        {
            Id = 1,
            Title = "   "
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("title cannot be empty", exception.Message.ToLower());
    }

    [Fact]
    public async Task UpdateWidget_WithWhitespaceOnlySubtitle_ThrowsException()
    {
        // Arrange
        var account = new Account { Id = 1 };
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var widget = new DashboardWidget
        {
            Id = 1,
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2
        };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(widget);

        var input = new UpdateWidgetInput
        {
            Id = 1,
            Subtitle = "\t\n  "
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("subtitle cannot be empty", exception.Message.ToLower());
    }

    [Fact]
    public async Task UpdateWidget_WithConfig_UpdatesConfig()
    {
        // Arrange
        var account = new Account { Id = 1 };
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var widget = new DashboardWidget
        {
            Id = 1,
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2
        };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(widget);
        _mockWidgetRepository.Setup(r => r.UpdateAsync(It.IsAny<DashboardWidget>()))
            .ReturnsAsync((DashboardWidget w) => w);

        var configJson = "{\"from\":\"2024-06-01\",\"to\":\"2024-12-31\"}";
        var input = new UpdateWidgetInput
        {
            Id = 1,
            Config = configJson
        };

        // Act
        var result = await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.Equal(configJson, widget.Config);
        Assert.Equal(configJson, result.Config);
    }

    [Fact]
    public async Task UpdateWidget_WithPartialUpdate_OnlyUpdatesProvidedFields()
    {
        // Arrange
        var account = new Account { Id = 1 };
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var widget = new DashboardWidget
        {
            Id = 1,
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2,
            Title = "Original Title",
            Subtitle = "Original Subtitle",
            Config = "{\"original\":true}"
        };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(widget);
        _mockWidgetRepository.Setup(r => r.UpdateAsync(It.IsAny<DashboardWidget>()))
            .ReturnsAsync((DashboardWidget w) => w);

        var input = new UpdateWidgetInput
        {
            Id = 1,
            Subtitle = "  Updated Subtitle  "
        };

        // Act
        var result = await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.Equal("Original Title", widget.Title); // Unchanged
        Assert.Equal("Updated Subtitle", widget.Subtitle); // Updated
        Assert.Equal("{\"original\":true}", widget.Config); // Unchanged
        Assert.Equal("Updated Subtitle", result.Subtitle);
    }
}
