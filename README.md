# PerfectPaw-server

Beginner-friendly CJS backend for the HomeForPaws frontend using Express + MongoDB (Mongoose).

## Stack

- Node.js + Express (CommonJS)
- MongoDB + Mongoose
- CORS, Helmet, Morgan, Dotenv

## Project Structure

```
.
├── app.js
├── package.json
├── package-lock.json
├── controllers/
├── db/
├── middleware/
├── models/
└── routes/
```

## Data Relationships

- One User can be an adopter, shelter_admin, or super_admin.
- One Shelter belongs to one shelter_admin user.
- One Shelter has many Pets.
- One Application connects one Adopter user to one Pet and one Shelter.

Main references:

- Pet.shelterId -> Shelter._id
- Application.petId -> Pet._id
- Application.adopterId -> User._id
- Application.shelterId -> Shelter._id

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Add your Mongo URI in `.env`.

## Run

```bash
npm run dev
```

## Seed Starter Pets

```bash
npm run seed:pets
```

## API Endpoints

- `GET /` : quick API check

- `GET /api/pets` : list pets
- `GET /api/pets/:petId` : single pet details
- `POST /api/pets` : create a pet (requires shelter_admin JWT)
- `GET /api/applications` : list adoption applications
- `POST /api/applications` : submit adoption application (requires adopter JWT)

##

Role enforcement:

- `POST /api/pets` only allows users with role `shelter_admin`.
- `POST /api/applications` only allows users with role `adopter`.

The server ignores any client-sent `adopterId` for applications and uses the authenticated user id.
For pet creation, the server uses the shelter linked to the authenticated shelter admin.

### POST /api/pets Body (minimum)

```json
{
	"shelterId": "<shelter_object_id>",
	"name": "Buddy",
	"species": "Dog",
	"sex": "Male",
	"age": 2,
	"ageGroup": "Young",
	"size": "Large"
}
```

### POST /api/applications Body (minimum)

```json
{
	"petId": "<pet_object_id>",
	"adopterId": "<user_object_id>",
	"message": "I have a fenced yard and experience with large dogs."
}
```

## Frontend Fit (HomeForPaws)

- Your current frontend uses local data in `src/data/pets.js`.
- This backend provides matching pet fields (`name`, `sex`, `age`, `ageGroup`, `size`, `traits`, `blurb`, `imageUrl`) so you can switch from local array to API fetch smoothly.
- Tailwind in frontend does not require backend changes; only `CORS_ORIGIN` needs to match your client URL.