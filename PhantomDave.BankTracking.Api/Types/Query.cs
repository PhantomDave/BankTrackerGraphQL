namespace PhantomDave.BankTracking.Api.Types;

[QueryType]
public static class Query
{
    public static Book GetBook(int id)
    {
        return id == 1 ? new Book("C# in depth.", new Author("Jon Skeet")) : new Book("Unknown", new Author("Unknown"));
    }

    public static IEnumerable<Book> GetBooks()
    {
        var random = new Random();
        var authors = new[]
        {
            "Jon Skeet", "Robert Martin", "Martin Fowler", "Eric Evans", "Andrew Troelsen", "Mark Russinovich",
            "Jeffrey Richter", "Scott Meyers", "Bjarne Stroustrup", "Don Box"
        };
        var titles = new[]
        {
            "C# in Depth", "Clean Code", "Refactoring", "Domain-Driven Design", "Pro C# 8", "Windows Internals",
            "CLR via C#", "Effective C++", "The C++ Programming Language", "Essential COM"
        };

        var books = Enumerable.Range(0, 10)
            .Select(i => new Book(
                titles[random.Next(titles.Length)],
                new Author(authors[random.Next(authors.Length)])
            ))
            .ToList();

        return books;
    }
}