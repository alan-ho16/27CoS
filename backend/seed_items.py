"""Seed script to populate the database with initial test loot items."""

from app import Item, app, db

# Default loot pool grouped by drop-rate tier
test_items = [
    # Common (high weight)
    {'name': 'Minor Health Potion', 'rarity': 'Common', 'weight': 50, 'desc': 'Restores 20 HP.'},
    {'name': 'Rusty Dagger', 'rarity': 'Common', 'weight': 40, 'desc': 'Better than using your fists.'},

    # Rare (medium weight)
    {'name': 'Steel Broadsword', 'rarity': 'Rare', 'weight': 15, 'desc': 'A sturdy weapon for a standard adventurer.'},
    {'name': 'Elixir of Strength', 'rarity': 'Rare', 'weight': 10, 'desc': 'Increases attack for 3 turns.'},

    # Legendary (low weight)
    {'name': 'Dragonfire Amulet', 'rarity': 'Legendary', 'weight': 2, 'desc': 'Grants immunity to fire.'},
    {'name': 'Blade of the Inferno', 'rarity': 'Legendary', 'weight': 1, 'desc': 'A mythical sword glowing with heat.'},
]

with app.app_context():
    # Ensure database tables exist before querying or inserting records
    db.create_all()

    for data in test_items:
        # Skip insertion if the item already exists to keep seeding idempotent
        if not Item.query.filter_by(name=data['name']).first():
            new_item = Item(
                name=data['name'],
                rarity=data['rarity'],
                drop_weight=data['weight'],
                description=data['desc'],
            )
            db.session.add(new_item)

    db.session.commit()
    print('Test items seeded successfully!')
