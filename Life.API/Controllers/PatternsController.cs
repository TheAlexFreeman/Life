using Life.API.Models;
using Life.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Life.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatternsController : ControllerBase
    {
        private readonly List<ApiPattern> memory = new List<ApiPattern>();
        private readonly LifeDBContext _context;

        public PatternsController(LifeDBContext context)
        {
            _context = context;
        }

        // GET: api/<PatternsController>
        [HttpGet]
        public IEnumerable<ApiPattern> Get()
        {
            return _context.Patterns.Select(p => new ApiPattern { Id = p.Id, Name = p.Name });
        }

        // GET api/<PatternsController>/5
        [HttpGet("{id}")]
        public ApiPattern Get(int id)
        {
            var pattern = _context.Patterns.ToList().FirstOrDefault(p => p.Id == id, null);
            if (pattern == null)
            {
                return new ApiPattern();
            } else
            {
                var apiPattern = new ApiPattern();
                apiPattern.Id = pattern.Id;
                apiPattern.Name = pattern.Name;
                apiPattern.Creator = pattern.Creator;
                apiPattern.DateCreated = pattern.DateCreated;
                foreach (var p in _context.Points.Where(p => p.PatternId == id))
                {
                    var apiPoint = new ApiPoint();
                    apiPoint.X = p.X;
                    apiPoint.Y = p.Y;
                    apiPattern.Points.Add(apiPoint);
                }
                return apiPattern;
            }
        }

        // POST api/<PatternsController>
        [HttpPost]
        public ApiPattern Post([FromBody] ApiPattern pattern)
        {
            var newPattern = new Pattern();
            newPattern.Name = pattern.Name;
            newPattern.Creator = pattern.Creator;
            _context.Patterns.Add(newPattern);
            _context.SaveChanges();

            newPattern = _context.Patterns.First(p => p.Name == pattern.Name && p.Creator == pattern.Creator);
            foreach (var p in pattern.Points)
            {
                var point = new Point();
                point.PatternId = newPattern.Id;
                point.X = p.X;
                point.Y = p.Y;
                _context.Points.Add(point);
            }
            _context.SaveChanges();
            pattern.Id = newPattern.Id;
            pattern.DateCreated = newPattern.DateCreated;
            return pattern;
        }

        // PUT api/<PatternsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] ApiPattern pattern)
        {
        }

        // DELETE api/<PatternsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
