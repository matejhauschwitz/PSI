using CsvHelper.Configuration;
using EFModels.Models;
using System.Globalization;

namespace WEA_BE.Models;

public sealed class BookMap : ClassMap<Book>
{
    public BookMap()
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = false,
            MissingFieldFound = null
        };
        AutoMap(config);
        Map(m => m.Id).Ignore();
        Map(m => m.IsHidden).Ignore();
        Map(m => m.ISBN10).Index(0);           // First column in CSV
        Map(m => m.ISBN13).Index(1);           // Second column
        Map(m => m.Title).Index(2);            // Third column
        Map(m => m.Subtitle).Index(3);         // Fourth column (can be empty)
        Map(m => m.Authors).Index(4);          // Fifth column
        Map(m => m.Genre).Index(5);            // Sixth column
        Map(m => m.CoverImageUrl).Index(6);    // Seventh column
        Map(m => m.Description).Index(7);      // Eighth column
        Map(m => m.PublicationYear).Index(8).Default(0);   // Ninth column
        Map(m => m.Rating).Index(9).Default(0.0);           // Tenth column
        Map(m => m.PageCount).Index(10).Default(0);        // Eleventh column
        Map(m => m.TotalRatings).Index(11).Default(0);    // Twelfth column
    }
}
