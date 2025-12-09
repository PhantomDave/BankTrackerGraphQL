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
    public async Task AddWidget_WithValidInput_CreatesWidget()
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
            Cols = 2
        };

        // Act
        var result = await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedWidget);
        Assert.Equal(1, capturedWidget.DashboardId);
        Assert.Equal(WidgetType.NetGraph, capturedWidget.Type);
        Assert.Equal(0, capturedWidget.X);
        Assert.Equal(0, capturedWidget.Y);
        Assert.Equal(2, capturedWidget.Rows);
        Assert.Equal(2, capturedWidget.Cols);
    }

    [Fact]
    public async Task AddWidget_WithNegativePosition_NormalizesToZero()
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
            X = -5,
            Y = -10,
            Rows = 2,
            Cols = 2
        };

        // Act
        var result = await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedWidget);
        Assert.Equal(0, capturedWidget.X);
        Assert.Equal(0, capturedWidget.Y);
    }

    [Fact]
    public async Task AddWidget_WithInvalidDashboard_ThrowsException()
    {
        // Arrange
        var account = new Account { Id = 1 };
        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Dashboard?)null);

        var input = new AddWidgetInput
        {
            DashboardId = 999,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 2,
            Cols = 2
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("not found", exception.Message.ToLower());
    }

    [Fact]
    public async Task AddWidget_WithInvalidRowsOrCols_ThrowsException()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        var account = new Account { Id = 1 };

        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);

        var input = new AddWidgetInput
        {
            DashboardId = 1,
            Type = WidgetType.NetGraph,
            X = 0,
            Y = 0,
            Rows = 0,
            Cols = 2
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.AddWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("rows and cols must be greater than 0", exception.Message.ToLower());
    }

    [Fact]
    public async Task UpdateWidget_WithValidData_UpdatesWidget()
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
            Type = WidgetType.CurrentBalance,
            X = 2,
            Y = 3,
            Rows = 4,
            Cols = 5
        };

        // Act
        var result = await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.Equal(WidgetType.CurrentBalance, widget.Type);
        Assert.Equal(2, widget.X);
        Assert.Equal(3, widget.Y);
        Assert.Equal(4, widget.Rows);
        Assert.Equal(5, widget.Cols);
    }

    [Fact]
    public async Task UpdateWidget_WithInvalidWidget_ThrowsException()
    {
        // Arrange
        var account = new Account { Id = 1 };
        _mockAccountRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(account);
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((DashboardWidget?)null);

        var input = new UpdateWidgetInput
        {
            Id = 999,
            Rows = 3
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("not found", exception.Message.ToLower());
    }

    [Fact]
    public async Task UpdateWidget_WithInvalidRowsOrCols_ThrowsException()
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
            Rows = -1
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.UpdateWidget(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("rows must be greater than 0", exception.Message.ToLower());
    }
}
