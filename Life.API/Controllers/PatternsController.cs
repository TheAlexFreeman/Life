using Life.API.Models;
using Life.Data.Entities;
using Life.Data.Repositories;
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
        private readonly PatternRepository _repo;

        public PatternsController(PatternRepository repo)
        {
            _repo = repo;
        }

        // GET: api/<PatternsController>
        [HttpGet]
        public IEnumerable<ApiPattern> Get()
        {
            return _repo.GetAllPatterns().Select(p => new ApiPattern(p));
        }

        // GET api/<PatternsController>/5
        [HttpGet("{id}")]
        public ApiPattern Get(int id)
        {
            var pattern = _repo.GetPatternById(id);
            if (pattern == null)
            {
                return new ApiPattern();
            } else
            {
                return new ApiPattern(pattern);
            }
        }

        // POST api/<PatternsController>
        [HttpPost]
        public ApiPattern Post([FromBody] ApiPattern pattern)
        {
            if (pattern == null) return null;

            var newPattern = new Pattern();
            newPattern.Name = pattern.Name;
            newPattern.Creator = pattern.Creator;

            foreach (var p in pattern.Points)
            {
                newPattern.Points.Add(new Point { X = p.X, Y = p.Y });
            }

            newPattern = _repo.AddPattern(newPattern);

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
            var success = _repo.DeletePattern(id);
            if (!success) throw new Exception("Could not delete Pattern #" + id);

        }
    }
}
