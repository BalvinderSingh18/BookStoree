using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using BookStore.Books.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Books
{
    public class BookAppService : ApplicationService, IBookAppService
    {
        private readonly IRepository<Book> _bookRepository;
        public BookAppService(IRepository<Book> bookRepository)
        {
                _bookRepository = bookRepository;
        }
        public async Task CreateAsync(CreateBookDto input)
        {
            try
            {
                var book = new Book
                {
                    Title = input.Title,
                    Author = input.Author,
                    PublishedDate = input.PublishedDate,
                    price = input.price,
                };
                await _bookRepository.InsertAsync(book);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task DeleteAsync(EntityDto<int> input)
        {
            try
            {
                await _bookRepository.DeleteAsync(input.Id);
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public async Task<PagedResultDto<GetBookDto>> GetAll()
        {
            try
            {
                var books = await _bookRepository.GetAllListAsync();
                var bookDtos = books.Select(b => new GetBookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    PublishedDate = b.PublishedDate,
                    price = b.price
                }).ToList();

                return new PagedResultDto<GetBookDto>(bookDtos.Count, bookDtos);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task UpdateAsync(CreateBookDto input)
        {
            try
            {
                var book = await _bookRepository.GetAsync(input.Id);

                book.Title = input.Title;
                book.Author = input.Author;
                book.PublishedDate = input.PublishedDate;
                book.price = input.price;

                await _bookRepository.UpdateAsync(book);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
