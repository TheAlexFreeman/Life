using Life.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Life.Data.Repositories
{
    public class PatternRepository
    {
        private readonly LifeDBContext _context;
        public PatternRepository(LifeDBContext context)
        {
            _context = context;
        }

        public IEnumerable<Pattern> GetAllPatterns() {
            return _context.Patterns;
        }

        public Pattern? GetPatternById(int id)
        {
            var result = _context.Patterns.Include(p => p.Points)
                .FirstOrDefault(p => p.Id == id);
            return result;
        }

        public Pattern AddPattern(Pattern pattern)
        {
            _context.Patterns.Add(pattern);
            _context.SaveChanges();
            return pattern;
        }

        public bool DeletePattern(int id)
        {
            var pattern = _context.Patterns.FirstOrDefault(p => p.Id == id);
            if (pattern == null) return false;
            _context.Patterns.Remove(pattern);
            return true;
        }
    }
}
