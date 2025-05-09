FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/BookStore.Web.Host/BookStore.Web.Host.csproj", "src/BookStore.Web.Host/"]
COPY ["src/BookStore.Web.Core/BookStore.Web.Core.csproj", "src/BookStore.Web.Core/"]
COPY ["src/BookStore.Application/BookStore.Application.csproj", "src/BookStore.Application/"]
COPY ["src/BookStore.Core/BookStore.Core.csproj", "src/BookStore.Core/"]
COPY ["src/BookStore.EntityFrameworkCore/BookStore.EntityFrameworkCore.csproj", "src/BookStore.EntityFrameworkCore/"]
WORKDIR "/src/src/BookStore.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/BookStore.Web.Host", "src/BookStore.Web.Host"]
COPY ["src/BookStore.Web.Core", "src/BookStore.Web.Core"]
COPY ["src/BookStore.Application", "src/BookStore.Application"]
COPY ["src/BookStore.Core", "src/BookStore.Core"]
COPY ["src/BookStore.EntityFrameworkCore", "src/BookStore.EntityFrameworkCore"]
WORKDIR "/src/src/BookStore.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "BookStore.Web.Host.dll"]
