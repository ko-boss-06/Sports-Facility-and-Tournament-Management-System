from app.database import SessionLocal
from app.models import Role, User
from app.core.security import hash_password


def seed_database():
    db = SessionLocal()

    try:
        # -----------------------------
        # 1. Create Roles
        # -----------------------------
        roles = [
            {
                "name": "PE",
                "description": "Physical Education Head"
            },
            {
                "name": "SPORTS_COORDINATOR",
                "description": "Sports Coordinator"
            },
            {
                "name": "COACH",
                "description": "Sports Coach"
            },
            {
                "name": "INTERNAL_STUDENT",
                "description": "Internal Student"
            },
            {
                "name": "EQUIPMENT_MANAGER",
                "description": "Equipment Manager"
            }
        ]

        role_objects = {}

        for role_data in roles:
            role = db.query(Role).filter(
                Role.name == role_data["name"]
            ).first()

            if not role:
                role = Role(
                    name=role_data["name"],
                    description=role_data["description"]
                )

                db.add(role)
                db.flush()

            role_objects[role.name] = role

        # -----------------------------
        # 2. Create Test Users
        # -----------------------------
        users = [
            {
                "name": "PE Administrator",
                "username": "pe_admin",
                "email": "pe@example.com",
                "password": "PE@12345",
                "role": "PE"
            },
            {
                "name": "Sports Coordinator",
                "username": "coordinator",
                "email": "coordinator@example.com",
                "password": "Coord@12345",
                "role": "SPORTS_COORDINATOR"
            },
            {
                "name": "Sports Coach",
                "username": "coach",
                "email": "coach@example.com",
                "password": "Coach@12345",
                "role": "COACH"
            },
            {
                "name": "Internal Student",
                "username": "student",
                "email": "student@example.com",
                "password": "Student@12345",
                "role": "INTERNAL_STUDENT"
            },
            {
                "name": "Equipment Manager",
                "username": "equipment",
                "email": "equipment@example.com",
                "password": "Equip@12345",
                "role": "EQUIPMENT_MANAGER"
            }
        ]

        for user_data in users:

            existing_user = db.query(User).filter(
                User.username == user_data["username"]
            ).first()

            if existing_user:
                print(
                    f"User already exists: {user_data['username']}"
                )
                continue

            user = User(
                name=user_data["name"],
                username=user_data["username"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role_id=role_objects[user_data["role"]].id,
                is_active=True
            )

            db.add(user)

            print(
                f"Created user: {user_data['username']}"
            )

        db.commit()

        print("\nDatabase seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print("\nDatabase seeding failed!")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()