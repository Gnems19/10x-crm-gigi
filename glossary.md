# Technical Glossary

Ten terms used in this project. Each entry: English definition + Georgian explanation in my own words.

---

### 1. Authentication
**EN:** The process of verifying a user's identity (here: email + password check against stored users).
**KA:** ავთენტიფიკაცია ნიშნავს იმის შემოწმებას, რომ მომხმარებელი ნამდვილად ის არის, ვინც ამბობს — ჩვენს აპში ეს არის იმეილისა და პაროლის შედარება `crm_users`-თან.

### 2. Session
**EN:** Short-lived record that the user is currently logged in (`crm_session` with `userId`, `email`, `loginAt`).
**KA:** სესია არის ჩანაწერი, რომ ახლა ვიღაც შესულია სისტემაში; ლოგაუთისას მხოლოდ ეს იშლება, ანგარიში და კლიენტები რჩება.

### 3. Validation
**EN:** Checking form input against rules before saving or sending data.
**KA:** ვალიდაცია არის ფორმის ველების შემოწმება წესებით (მაგალითად პაროლი მინიმუმ 8 სიმბოლო), სანამ მონაცემს შევინახავთ.

### 4. Fetch
**EN:** Browser API to make HTTP requests and get a Promise-based response.
**KA:** `fetch` არის ბრაუზერის ფუნქცია, რომლითაც სერვერს ვთხოვთ მონაცემებს ან ვაგზავნით ცვლილებას (GET/POST/DELETE).

### 5. Endpoint
**EN:** A specific URL path on an API that performs an action (e.g. `/users?limit=30`).
**KA:** ენდფოინთი არის API-ს კონკრეტული მისამართი, სადაც ერთი მოქმედება ხდება — მაგალითად მომხმარებლების სიის წამოღება.

### 6. Request method
**EN:** The HTTP verb describing intent: GET (read), POST (create), DELETE (remove), etc.
**KA:** რექვესთის მეთოდი ამბობს რა გვინდა: წაკითხვა (GET), დამატება (POST) ან წაშლა (DELETE).

### 7. JSON
**EN:** Text format for structured data; used in API bodies and in `localStorage` strings.
**KA:** JSON არის ტექსტური ფორმატი ობიექტებისა და მასივების შესანახად — API-ც და `localStorage`-ც ამას იყენებს.

### 8. State
**EN:** The current in-memory data the UI renders from (e.g. `clientsState` array).
**KA:** სტეიტი არის აპის მიმდინარე მეხსიერება — როცა იცვლება, ვინახავთ და ეკრანს თავიდან ვხატავთ.

### 9. Event listener
**EN:** A function registered to run when something happens in the DOM (`click`, `submit`, `input`).
**KA:** ივენთ ლისენერი არის კოდი, რომელიც ელოდება მოქმედებას (ღილაკზე დაჭერა, ფორმის გაგზავნა) და მაშინ გაეშვება.

### 10. Deployment
**EN:** Publishing the site to a host so others can open it via a public URL (e.g. Vercel).
**KA:** დეპლოი ნიშნავს პროექტის ატვირთვას ჰოსტზე, რომ ლაივ ბმულით ყველამ გახსნას — არა მხოლოდ ჩემს კომპიუტერზე.
