```mermaid
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
    }

    class Book {
        +int Id
        +string Title
        +string Authors
        +double Price
        +ICollection~Comment~ Comments
    }

    class Comment {
        +int Id
        +string Content
        +double Rating
    }

    class User {
        +int Id
        +string UserName
        +Address Address
    }

    %% Relationships
    User "1" -- "0..*" Comment : "píše"
    Book "1" -- "0..*" Comment : "má"
    User "1" -- "1..2" Address : "vlastní"
    Book "0..*" -- "0..*" User : "oblíbené"