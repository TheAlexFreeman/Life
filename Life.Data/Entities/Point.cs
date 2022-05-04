using System;
using System.Collections.Generic;

namespace Life.Data.Entities
{
    public partial class Point
    {
        public int Id { get; set; }
        public int PatternId { get; set; }
        public int X { get; set; }
        public int Y { get; set; }

        public virtual Pattern Pattern { get; set; }
    }
}
