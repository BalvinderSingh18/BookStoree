using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Hosting;
using BookStore.Authorization.Users;
using Microsoft.AspNetCore.Identity;
using BookStore.SignalR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;

namespace BookStore.Controllers
{
    [Route("api/[controller]/[action]")]
    [AbpMvcAuthorize] // Requires authentication
    public class AttachmentController : BookStoreControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly UserManager _userManager;

        public AttachmentController(IWebHostEnvironment env, UserManager userManager)
        {
            _env = env;
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            var uploadsFolder = Path.Combine(_env.WebRootPath, "upload");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"{Request.Scheme}://{Request.Host}/upload/{uniqueFileName}";
            //var fileName = file.FileName;
            var originalName = Path.GetFileName(file.FileName);
            var fileName = string.IsNullOrWhiteSpace(originalName) || originalName.ToLower() == "blob"
                ? uniqueFileName
                : originalName;
            var fileType = file.ContentType;

            return Ok(new
            {
                fileUrl,
                fileName,
                fileType
            });
        }
        [HttpGet]
        [Route("api/Attachment/Download")]
        public IActionResult Download(string fileName)
        {
            var filePath = Path.Combine(_env.WebRootPath, "upload", fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("File not found.");
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            var contentType = "application/octet-stream"; // Force download
            var encodedFileName = Uri.EscapeDataString(fileName);

            return File(fileBytes, contentType, encodedFileName);
        }
        [HttpPost]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(_env.WebRootPath, "upload");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var userId = AbpSession.UserId.Value;
            var user = await _userManager.GetUserByIdAsync(userId);
            user.ProfilePictureFileName = uniqueFileName;
            await _userManager.UpdateAsync(user);

            var fileUrl = $"{Request.Scheme}://{Request.Host}/upload/{uniqueFileName}";

            // ⏬ SignalR Broadcast
            var context = HttpContext.RequestServices.GetService<IHubContext<ChatHub>>();
            await context.Clients.All.SendAsync("UserProfilePictureUpdated", userId.ToString(), uniqueFileName);

            return Ok(new { result = fileUrl });
        }



    }
}
