namespace Life.API.Models
{
    public class ApiPattern
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Creator { get; set; }
        public DateTime DateCreated { get; set; }
        public List<ApiPoint> Points { get; set; } = new List<ApiPoint>();
    }
}
