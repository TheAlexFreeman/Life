using Life.Data.Entities;

namespace Life.API.Models
{
    public class ApiPattern
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? Creator { get; set; }
        public DateTime? DateCreated { get; set; }
        public List<ApiPoint> Points { get; set; } = new List<ApiPoint>();

        public ApiPattern() { }

        public ApiPattern(Pattern pattern)
        {
            Id = pattern.Id;
            Name = pattern.Name;
            Creator = pattern.Creator;
            DateCreated = pattern.DateCreated;

            foreach (var point in pattern.Points)
            {
                Points.Add(new ApiPoint() { X = point.X, Y = point.Y });
            }
        }
    }
}
