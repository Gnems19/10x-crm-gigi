# Research Note

## Source

- **Title:** Using the Fetch API  
- **URL:** https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch  
- **Also consulted:** https://dummyjson.com/docs/users  

## Search keywords

`MDN fetch async await`, `fetch response.ok`, `DummyJSON users API POST DELETE`

## Summary (Georgian)

MDN-ის სტატიაში ავხსენი, როგორ მუშაობს `fetch`: ის აბრუნებს Promise-ს, პასუხს ვკითხულობთ `response.json()`-ით და შეცდომებისთვის ვამოწმებთ `response.ok`-ს, რადგან ქსელური წარმატება არ ნიშნავს ყოველთვის 200 სტატუსს. `async/await` ამ კოდს უფრო წაკითხვადს ხდის, ვიდრე გრძელ `.then()` ჯაჭვებს. DummyJSON-ის დოკუმენტაციაში ვნახე, რომ `GET /users`, `POST /users/add` და `DELETE /users/{id}` საკმარისია სასწავლო CRUD-ისთვის, თუმცა ჩაწერის ოპერაციები სიმულირებულია — ამიტომ რეალური შენახვა ჩვენს პროექტში `localStorage`-ზეა. ამ ორმა წყარომ დამეხმარა Clients გვერდის ჩატვირთვის, დამატების და წაშლის ლოგიკის სწორად აწყობაში და გამოცდაზე ასახსნელად მომზადებაში.
