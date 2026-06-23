# Run All Migrations

เอกสารนี้อธิบายวิธีรันไฟล์ SQL ในโฟลเดอร์ `src/migrations` ทั้งหมดสำหรับโปรเจกต์นี้

## ไฟล์ Migration ตามลำดับ

รันตามลำดับชื่อไฟล์:

1. `src/migrations/001_create_users_table.sql`
2. `src/migrations/002_create_roles_tables.sql`
3. `src/migrations/003_create_trees_table.sql`
4. `src/migrations/004_add_image_url_to_trees.sql`
5. `src/migrations/005_add_status_to_trees.sql`
6. `src/migrations/006_create_cart_items_table.sql`
7. `src/migrations/007_create_orders_tables.sql`
8. `src/migrations/010_add_payment_method_to_orders.sql`
9. `src/migrations/012_add_sales_channel_to_orders.sql`
10. `src/migrations/013_add_orders_status_check.sql`
11. `src/migrations/014_add_address_fields_to_users.sql`
12. `src/migrations/015_add_subdistrict_to_users.sql`
13. `src/migrations/016_add_payment_slip_to_orders.sql`
14. `src/migrations/017_add_payment_review_order_status.sql`
15. `src/migrations/018_add_fulfillment_method_to_orders.sql`
16. `src/migrations/019_add_pickup_schedule_to_orders.sql`

---

## วิธีที่ 1: รันทีละไฟล์ (Docker Local)

ใช้เมื่อรัน PostgreSQL ใน container ชื่อ `postgres` และฐานข้อมูล `treedb`

```bash
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/001_create_users_table.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/002_create_roles_tables.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/003_create_trees_table.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/004_add_image_url_to_trees.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/005_add_status_to_trees.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/006_create_cart_items_table.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/007_create_orders_tables.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/010_add_payment_method_to_orders.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/012_add_sales_channel_to_orders.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/013_add_orders_status_check.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/014_add_address_fields_to_users.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/015_add_subdistrict_to_users.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/016_add_payment_slip_to_orders.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/017_add_payment_review_order_status.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/018_add_fulfillment_method_to_orders.sql"
docker exec -i postgres psql -U myuser -d treedb < "src/migrations/019_add_pickup_schedule_to_orders.sql"
```

---

## วิธีที่ 2: รันทั้งหมดครั้งเดียว (Docker Local)

```bash
for f in src/migrations/*.sql; do
  echo "Running $f ..."
  docker exec -i postgres psql -U myuser -d treedb < "$f"
done
```

---

## วิธีที่ 3: รันทั้งหมดครั้งเดียว (Railway / Connection String)

```bash
for f in src/migrations/*.sql; do
  echo "Running $f ..."
  psql "postgresql://<user>:<password>@<host>:<port>/<database>" < "$f"
done
```

ตัวอย่าง:

```bash
psql "postgresql://postgres:YOUR_PASSWORD@nozomi.proxy.rlwy.net:21804/railway" < "src/migrations/001_create_users_table.sql"
```

---

## วิธีตรวจสอบหลังรัน

### ตรวจสอบรายการตาราง (Docker)

```bash
docker exec -it postgres psql -U myuser -d treedb -c "\dt"
```

### ตรวจสอบคอลัมน์ของตาราง `orders` (Docker)

```bash
docker exec -it postgres psql -U myuser -d treedb -c "\d orders"
```

---

## Troubleshooting

- **`relation already exists`**
  - ปกติไม่ใช่ปัญหา ถ้า migration ใช้ `IF NOT EXISTS`

- **`password authentication failed`**
  - ตรวจ user/password/db ให้ตรงกับ `docker-compose.yml` หรือ connection string

- **`No such file or directory`**
  - รันคำสั่งจาก root โปรเจกต์ (โฟลเดอร์ที่มี `src/`)

- **`container postgres is not running`**
  - สั่ง start ก่อน:
  ```bash
  docker compose up -d
  ```
