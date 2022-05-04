using System;
using System.Collections.Generic;

namespace Life.Data.Entities
{
    public partial class Pattern
    {
        public Pattern()
        {
            Points = new HashSet<Point>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Creator { get; set; }
        public DateTime DateCreated { get; set; }

        public virtual ICollection<Point> Points { get; set; }
    }
}
