using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using BookStore.Authorization.Roles;
using BookStore.Authorization.Users;
using BookStore.MultiTenancy;
using BookStore.Books;
using BookStore.Courses;
using BookStore.Students;
using BookStore.Countries;
using BookStore.States;
using BookStore.Cities;
using BookStore.Beds;
using BookStore.Patients;
using BookStore.Addmissions;
using BookStore.FileUploads;
using BookStore.Departments;
using BookStore.Employees;
using BookStore.Deals;
using BookStore.Tasks;

namespace BookStore.EntityFrameworkCore
{
    public class BookStoreDbContext : AbpZeroDbContext<Tenant, Role, User, BookStoreDbContext>
    {
        /* Define a DbSet for each entity of the application */
        
        public BookStoreDbContext(DbContextOptions<BookStoreDbContext> options)
            : base(options)
        {
        }
        public DbSet<Book> Books { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<State> States { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Bed> Beds { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Addmission> Addmissions { get; set; }
        public DbSet<FileUpload> FileUploads { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Deal> Deals { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
    }
}
