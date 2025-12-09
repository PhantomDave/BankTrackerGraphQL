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

public class DashboardMutationsTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Dashboard>> _mockDashboardRepository;
    private readonly Mock<IRepository<Account>> _mockAccountRepository;
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly DashboardMutations _mutations;

    public DashboardMutationsTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockDashboardRepository = new Mock<IRepository<Dashboard>>();
        _mockAccountRepository = new Mock<IRepository<Account>>();
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

        _mockUnitOfWork.Setup(u => u.Dashboards).Returns(_mockDashboardRepository.Object);
        _mockUnitOfWork.Setup(u => u.Accounts).Returns(_mockAccountRepository.Object);

        _mutations = new DashboardMutations();

        // Setup a default authenticated context
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "1") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = claimsPrincipal };
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
    }

    [Fact]
    public async Task CreateDashboard_WithValidName_CreatesDashboard()
    {
        // Arrange
        Dashboard? capturedDashboard = null;
        _mockDashboardRepository
            .Setup(r => r.AddAsync(It.IsAny<Dashboard>()))
            .Callback<Dashboard>(d => capturedDashboard = d)
            .ReturnsAsync((Dashboard d) => d);

        var input = new CreateDashboardInput { Name = "My Dashboard" };

        // Act
        var result = await _mutations.CreateDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedDashboard);
        Assert.Equal("My Dashboard", capturedDashboard.Name);
        Assert.Equal(1, capturedDashboard.AccountId);
        _mockDashboardRepository.Verify(r => r.AddAsync(It.IsAny<Dashboard>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateDashboard_WithEmptyName_ThrowsException()
    {
        // Arrange
        var input = new CreateDashboardInput { Name = "   " };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.CreateDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("cannot be empty", exception.Message.ToLower());
        _mockDashboardRepository.Verify(r => r.AddAsync(It.IsAny<Dashboard>()), Times.Never);
    }

    [Fact]
    public async Task CreateDashboard_WithLongName_TruncatesName()
    {
        // Arrange
        var longName = new string('a', 150);
        Dashboard? capturedDashboard = null;

        _mockDashboardRepository
            .Setup(r => r.AddAsync(It.IsAny<Dashboard>()))
            .Callback<Dashboard>(d => capturedDashboard = d)
            .ReturnsAsync((Dashboard d) => d);

        var input = new CreateDashboardInput { Name = longName };

        // Act
        var result = await _mutations.CreateDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.NotNull(capturedDashboard);
        Assert.Equal(100, capturedDashboard.Name.Length);
    }

    [Fact]
    public async Task UpdateDashboard_WithValidData_UpdatesDashboard()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Old Name", AccountId = 1 };

        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockDashboardRepository.Setup(r => r.UpdateAsync(It.IsAny<Dashboard>()))
            .ReturnsAsync((Dashboard d) => d);

        var input = new UpdateDashboardInput { Id = 1, Name = "New Name" };

        // Act
        var result = await _mutations.UpdateDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input);

        // Assert
        Assert.Equal("New Name", dashboard.Name);
        _mockDashboardRepository.Verify(r => r.UpdateAsync(It.IsAny<Dashboard>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateDashboard_WithInvalidId_ThrowsException()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Dashboard?)null);

        var input = new UpdateDashboardInput { Id = 999, Name = "New Name" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.UpdateDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("not found", exception.Message.ToLower());
        _mockDashboardRepository.Verify(r => r.UpdateAsync(It.IsAny<Dashboard>()), Times.Never);
    }

    [Fact]
    public async Task UpdateDashboard_WithWrongAccountId_ThrowsException()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 999 };
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);

        var input = new UpdateDashboardInput { Id = 1, Name = "New Name" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.UpdateDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, input)
        );

        Assert.Contains("not found", exception.Message.ToLower());
    }

    [Fact]
    public async Task DeleteDashboard_WithValidId_DeletesDashboard()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 1 };
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);
        _mockDashboardRepository.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

        // Act
        var result = await _mutations.DeleteDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, 1);

        // Assert
        Assert.True(result);
        _mockDashboardRepository.Verify(r => r.DeleteAsync(1), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteDashboard_WithInvalidId_ThrowsException()
    {
        // Arrange
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Dashboard?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.DeleteDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, 999)
        );

        Assert.Contains("not found", exception.Message.ToLower());
        _mockDashboardRepository.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task DeleteDashboard_WithWrongAccountId_ThrowsException()
    {
        // Arrange
        var dashboard = new Dashboard { Id = 1, Name = "Test", AccountId = 999 };
        _mockDashboardRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(dashboard);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<GraphQLException>(
            async () => await _mutations.DeleteDashboard(_mockUnitOfWork.Object, _mockHttpContextAccessor.Object, 1)
        );

        Assert.Contains("not found", exception.Message.ToLower());
    }
}
