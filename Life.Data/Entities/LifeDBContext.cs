using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Life.Data.Entities
{
    public partial class LifeDBContext : DbContext
    {
        public LifeDBContext()
        {
        }

        public LifeDBContext(DbContextOptions<LifeDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Pattern> Patterns { get; set; }
        public virtual DbSet<Point> Points { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Pattern>(entity =>
            {
                entity.ToTable("Patterns", "Life");

                entity.HasIndex(e => new { e.Name, e.Creator }, "U_Name_Creator")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.Creator).HasMaxLength(32);

                entity.Property(e => e.DateCreated).HasDefaultValueSql("(sysdatetime())");

                entity.Property(e => e.Name).HasMaxLength(32);
            });

            modelBuilder.Entity<Point>(entity =>
            {
                entity.ToTable("Points", "Life");

                entity.HasIndex(e => new { e.PatternId, e.X, e.Y }, "U_PatternID_X_Y")
                    .IsUnique();

                entity.Property(e => e.Id).HasColumnName("ID");

                entity.Property(e => e.PatternId).HasColumnName("PatternID");

                entity.HasOne(d => d.Pattern)
                    .WithMany(p => p.Points)
                    .HasForeignKey(d => d.PatternId)
                    .HasConstraintName("FK_Points_PatternID_to_Patterns")
                    .OnDelete(DeleteBehavior.SetNull);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
