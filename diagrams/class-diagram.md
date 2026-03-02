classDiagram
    class Address {
        +int Id
        +string StreetAddress
        +string City
        +string Zip
        +string Country
    }

    class AuditLog {
        +int Id
        +string Original
        +string Updated
        +DateTime CreatedDate
        +string userName
        +LogType LogType
    }

    class Book {
        +int Id
        +string Title
        +string Authors
        +double Price
        +ICollection~Comment~ Comments
        +ICollection~User~ Users
        +ICollection~Order~ Orders
        +ICollection~Genre~ Genres
    }

    class Comment {
        +int Id
        +string Content
        +int BookId
        +int UserId
        +double Rating
    }

    class Genre {
        +int Id
        +string Name
    }

    class Order {
        +int Id
        +List~Book~ Books
        +User User
        +double totalPrice
        +PaymentMethod PaymentMethod
        +OrderStatus Status
    }

    class User {
        +int Id
        +string UserName
        +Address Address
        +Address BillingAddress
        +ICollection~Comment~ Comments
        +ICollection~Book~ FavouriteBooks
    }

    %% Relationships
    User "1" -- "0..*" Comment : píše
    Book "1" -- "0..*" Comment : má
    User "0..2" -- "1" Address : bydlí/fakturuje
    Order "0..*" -- "1" User : vytvořil
    Book "0..*" -- "0..*" Genre : patří do
    Book "0..*" -- "0..*" Order : obsahuje
    User "0..*" -- "0..*" Book : má v oblíbených
