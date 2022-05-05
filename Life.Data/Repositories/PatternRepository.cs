using Life.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Life.Data.Repositories
{
    public class PatternRepository
    {
        private LifeDBContext _context;
        public PatternRepository(LifeDBContext context)
        {
            _context = context;
        }

        public IEnumerable<Pattern> GetAllPatterns() {
            return _context.Patterns;
        }

        public Pattern GetPatternById(int id)
        {
            var result = _context.Patterns.FirstOrDefault(p => p.Id == id);
            if (result == null) return null;

            foreach (var point in _context.Points.Where(p => p.PatternId == id))
            {
                result.Points.Add(point);
            }
            return result;
        }

        public Pattern AddPattern(Pattern pattern)
        {
            _context.Patterns.Add(pattern);
            _context.SaveChanges();

            //foreach (var point in pattern.Points)
            //{
            //    point.PatternId = pattern.Id;
            //    _context.Points.Add(point);
            //}
            //_context.SaveChanges();
            return pattern;
        }
    }
}
