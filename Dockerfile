FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY ["PhantomDave.BankTracking.Api/PhantomDave.BankTracking.Api.csproj", "PhantomDave.BankTracking.Api/"]
COPY ["PhantomDave.BankTracking.Library/PhantomDave.BankTracking.Library.csproj", "PhantomDave.BankTracking.Library/"]
COPY ["PhantomDave.BankTracking.Data/PhantomDave.BankTracking.Data.csproj", "PhantomDave.BankTracking.Data/"]

RUN dotnet restore "PhantomDave.BankTracking.Api/PhantomDave.BankTracking.Api.csproj"

COPY . .

WORKDIR /src/PhantomDave.BankTracking.Api

FROM build AS publish
RUN dotnet publish "PhantomDave.BankTracking.Api.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=publish /app/publish .

# Copy all appsettings files
COPY PhantomDave.BankTracking.Api/appsettings*.json ./

EXPOSE 5095

ENV ASPNETCORE_ENVIRONMENT=Docker
ENV ASPNETCORE_URLS=http://+:5095

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5095/graphql?sdl || exit 1

ENTRYPOINT ["dotnet", "PhantomDave.BankTracking.Api.dll"]

