FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY ["PhantomDave.BankTracking.Api/PhantomDave.BankTracking.Api.csproj", "PhantomDave.BankTracking.Api/"]
COPY ["PhantomDave.BankTracking.Library/PhantomDave.BankTracking.Library.csproj", "PhantomDave.BankTracking.Library/"]
COPY ["PhantomDave.BankTracking.Data/PhantomDave.BankTracking.Data.csproj", "PhantomDave.BankTracking.Data/"]

RUN dotnet restore "PhantomDave.BankTracking.Api/PhantomDave.BankTracking.Api.csproj"

COPY . .

WORKDIR /src/PhantomDave.BankTracking.Api
RUN dotnet build "PhantomDave.BankTracking.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PhantomDave.BankTracking.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

WORKDIR /app

COPY --from=publish /app/publish .

EXPOSE 5095

ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:5095

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD dotnet /app/PhantomDave.BankTracking.Api.dll || exit 1

ENTRYPOINT ["dotnet", "PhantomDave.BankTracking.Api.dll"]

