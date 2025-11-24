using Microsoft.EntityFrameworkCore;
using Moq;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Data.Repositories;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.UnitTests.Services;

public class DashboardServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Dashboard>> _mockDashboardRepository;
    private readonly Mock<IRepository<DashboardWidget>> _mockWidgetRepository;
    private readonly DashboardService _service;

    public DashboardServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockDashboardRepository = new Mock<IRepository<Dashboard>>();
        _mockWidgetRepository = new Mock<IRepository<DashboardWidget>>();

        _mockUnitOfWork.Setup(u => u.Dashboards).Returns(_mockDashboardRepository.Object);
        _mockUnitOfWork.Setup(u => u.DashboardWidgets).Returns(_mockWidgetRepository.Object);

        _service = new DashboardService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetDashboardAsync_WithValidId_ReturnsDashboard()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test Dashboard" };
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(dashboard);

        // Act
        var result = await _service.GetDashboardAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("Test Dashboard", result.Name);
    }

    [Fact]
    public async Task GetDashboardAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Dashboard?)null);

        // Act
        var result = await _service.GetDashboardAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateDashboardAsync_WithValidName_CreatesDashboard()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.AddAsync(It.IsAny<Dashboard>()))
            .ReturnsAsync((Dashboard d) => d);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateDashboardAsync("My Dashboard");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("My Dashboard", result.Name);
        Assert.NotNull(result.Widgets);
        _mockDashboardRepository.Verify(r => r.AddAsync(It.IsAny<Dashboard>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateDashboardAsync_WithEmptyName_ReturnsNull()
    {
        // Act
        var result = await _service.CreateDashboardAsync("");

        // Assert
        Assert.Null(result);
        _mockDashboardRepository.Verify(r => r.AddAsync(It.IsAny<Dashboard>()), Times.Never);
    }

    [Fact]
    public async Task CreateDashboardAsync_WithWhitespaceName_ReturnsNull()
    {
        // Act
        var result = await _service.CreateDashboardAsync("   ");

        // Assert
        Assert.Null(result);
        _mockDashboardRepository.Verify(r => r.AddAsync(It.IsAny<Dashboard>()), Times.Never);
    }

    [Fact]
    public async Task CreateDashboardAsync_TruncatesLongName()
    {
        // Arrange
        var longName = new string('a', 150);
        Dashboard? capturedDashboard = null;
        
        _mockDashboardRepository.Setup(r => r.AddAsync(It.IsAny<Dashboard>()))
            .Callback<Dashboard>(d => capturedDashboard = d)
            .ReturnsAsync((Dashboard d) => d);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateDashboardAsync(longName);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(100, result.Name.Length);
        Assert.NotNull(capturedDashboard);
        Assert.Equal(100, capturedDashboard.Name.Length);
    }

    [Fact]
    public async Task UpdateDashboardAsync_WithValidData_UpdatesDashboard()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Old Name" };
        
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(dashboard);
        
        _mockDashboardRepository.Setup(r => r.UpdateAsync(It.IsAny<Dashboard>()))
            .ReturnsAsync((Dashboard d) => d);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateDashboardAsync(1, "New Name");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Name", result.Name);
        _mockDashboardRepository.Verify(r => r.UpdateAsync(It.IsAny<Dashboard>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateDashboardAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Dashboard?)null);

        // Act
        var result = await _service.UpdateDashboardAsync(999, "New Name");

        // Assert
        Assert.Null(result);
        _mockDashboardRepository.Verify(r => r.UpdateAsync(It.IsAny<Dashboard>()), Times.Never);
    }

    [Fact]
    public async Task UpdateDashboardAsync_WithEmptyName_DoesNotUpdateName()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Old Name" };
        
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(dashboard);
        
        _mockDashboardRepository.Setup(r => r.UpdateAsync(It.IsAny<Dashboard>()))
            .ReturnsAsync((Dashboard d) => d);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateDashboardAsync(1, "   ");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Old Name", result.Name); // Name should remain unchanged
        _mockDashboardRepository.Verify(r => r.UpdateAsync(It.IsAny<Dashboard>()), Times.Once);
    }

    [Fact]
    public async Task DeleteDashboardAsync_WithValidId_DeletesDashboard()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.DeleteAsync(1))
            .ReturnsAsync(true);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.DeleteDashboardAsync(1);

        // Assert
        Assert.True(result);
        _mockDashboardRepository.Verify(r => r.DeleteAsync(1), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteDashboardAsync_WithInvalidId_ReturnsFalse()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.DeleteAsync(It.IsAny<int>()))
            .ReturnsAsync(false);

        // Act
        var result = await _service.DeleteDashboardAsync(999);

        // Assert
        Assert.False(result);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task AddWidgetAsync_WithValidData_AddsWidget()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test" };
        
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(dashboard);
        
        _mockWidgetRepository.Setup(r => r.AddAsync(It.IsAny<DashboardWidget>()))
            .ReturnsAsync((DashboardWidget w) => w);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.AddWidgetAsync(1, WidgetType.NetGraph, 0, 0, 2, 2);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.DashboardId);
        Assert.Equal(WidgetType.NetGraph, result.Type);
        Assert.Equal(0, result.X);
        Assert.Equal(0, result.Y);
        Assert.Equal(2, result.Rows);
        Assert.Equal(2, result.Cols);
        _mockWidgetRepository.Verify(r => r.AddAsync(It.IsAny<DashboardWidget>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task AddWidgetAsync_WithInvalidDashboard_ReturnsNull()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Dashboard?)null);

        // Act
        var result = await _service.AddWidgetAsync(999, WidgetType.NetGraph, 0, 0, 2, 2);

        // Assert
        Assert.Null(result);
        _mockWidgetRepository.Verify(r => r.AddAsync(It.IsAny<DashboardWidget>()), Times.Never);
    }

    [Fact]
    public async Task AddWidgetAsync_WithNegativeRows_ReturnsNull()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test" };
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(dashboard);

        // Act
        var result = await _service.AddWidgetAsync(1, WidgetType.NetGraph, 0, 0, -1, 2);

        // Assert
        Assert.Null(result);
        _mockWidgetRepository.Verify(r => r.AddAsync(It.IsAny<DashboardWidget>()), Times.Never);
    }

    [Fact]
    public async Task AddWidgetAsync_WithZeroCols_ReturnsNull()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test" };
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(dashboard);

        // Act
        var result = await _service.AddWidgetAsync(1, WidgetType.NetGraph, 0, 0, 2, 0);

        // Assert
        Assert.Null(result);
        _mockWidgetRepository.Verify(r => r.AddAsync(It.IsAny<DashboardWidget>()), Times.Never);
    }

    [Fact]
    public async Task AddWidgetAsync_WithNegativePosition_NormalizesToZero()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test" };
        DashboardWidget? capturedWidget = null;
        
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(dashboard);
        
        _mockWidgetRepository.Setup(r => r.AddAsync(It.IsAny<DashboardWidget>()))
            .Callback<DashboardWidget>(w => capturedWidget = w)
            .ReturnsAsync((DashboardWidget w) => w);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.AddWidgetAsync(1, WidgetType.NetGraph, -5, -10, 2, 2);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.X);
        Assert.Equal(0, result.Y);
        Assert.NotNull(capturedWidget);
        Assert.Equal(0, capturedWidget.X);
        Assert.Equal(0, capturedWidget.Y);
    }

    [Fact]
    public async Task UpdateWidgetAsync_WithValidData_UpdatesWidget()
    {
        // Arrange
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

        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(widget);
        
        _mockWidgetRepository.Setup(r => r.UpdateAsync(It.IsAny<DashboardWidget>()))
            .ReturnsAsync((DashboardWidget w) => w);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateWidgetAsync(1, WidgetType.CurrentBalance, 1, 1, 3, 3);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(WidgetType.CurrentBalance, result.Type);
        Assert.Equal(1, result.X);
        Assert.Equal(1, result.Y);
        Assert.Equal(3, result.Rows);
        Assert.Equal(3, result.Cols);
        _mockWidgetRepository.Verify(r => r.UpdateAsync(It.IsAny<DashboardWidget>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateWidgetAsync_WithInvalidId_ReturnsNull()
    {
        // Arrange
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((DashboardWidget?)null);

        // Act
        var result = await _service.UpdateWidgetAsync(999, rows: 3);

        // Assert
        Assert.Null(result);
        _mockWidgetRepository.Verify(r => r.UpdateAsync(It.IsAny<DashboardWidget>()), Times.Never);
    }

    [Fact]
    public async Task UpdateWidgetAsync_WithZeroRows_ReturnsNull()
    {
        // Arrange
        var widget = new DashboardWidget { Id = 1, DashboardId = 1, Rows = 2, Cols = 2 };
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(widget);

        // Act
        var result = await _service.UpdateWidgetAsync(1, rows: 0);

        // Assert
        Assert.Null(result);
        _mockWidgetRepository.Verify(r => r.UpdateAsync(It.IsAny<DashboardWidget>()), Times.Never);
    }

    [Fact]
    public async Task UpdateWidgetAsync_WithNegativeCols_ReturnsNull()
    {
        // Arrange
        var widget = new DashboardWidget { Id = 1, DashboardId = 1, Rows = 2, Cols = 2 };
        _mockWidgetRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(widget);

        // Act
        var result = await _service.UpdateWidgetAsync(1, cols: -1);

        // Assert
        Assert.Null(result);
        _mockWidgetRepository.Verify(r => r.UpdateAsync(It.IsAny<DashboardWidget>()), Times.Never);
    }

    [Fact]
    public async Task RemoveWidgetAsync_WithValidId_RemovesWidget()
    {
        // Arrange
        _mockWidgetRepository.Setup(r => r.DeleteAsync(1))
            .ReturnsAsync(true);
        
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _service.RemoveWidgetAsync(1);

        // Assert
        Assert.True(result);
        _mockWidgetRepository.Verify(r => r.DeleteAsync(1), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task RemoveWidgetAsync_WithInvalidId_ReturnsFalse()
    {
        // Arrange
        _mockWidgetRepository.Setup(r => r.DeleteAsync(It.IsAny<int>()))
            .ReturnsAsync(false);

        // Act
        var result = await _service.RemoveWidgetAsync(999);

        // Assert
        Assert.False(result);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never);
    }
}
