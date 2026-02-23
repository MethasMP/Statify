-- V2: Seed categorization rules + fix file_type to include xlsx

-- 1. Add xlsx to uploads file_type constraint
ALTER TABLE uploads DROP CONSTRAINT IF EXISTS uploads_file_type_check;
ALTER TABLE uploads ADD CONSTRAINT uploads_file_type_check
    CHECK (file_type IN ('csv', 'pdf', 'xlsx', 'xls'));

-- 2. Seed default categorization rules (keyword → category, system-only)
INSERT INTO categorization_rules (keyword, category_id, priority) VALUES
-- Food & Drink (cat id 1)
('KFC',          1, 10),
('McDONALD',     1, 10),
('GRAB FOOD',    1, 10),
('FOODPANDA',    1, 10),
('COFFEE',       1, 10),
('STARBUCKS',    1, 10),
('RESTAURANT',   1, 5),
('PIZZA',        1, 10),
('CAFE',         1, 5),
('ร้านอาหาร',    1, 5),

-- Transport (cat id 2)
('GRAB',         2, 8),
('BOLT',         2, 8),
('BTS',          2, 10),
('MRT',          2, 10),
('TAXI',         2, 8),
('FUEL',         2, 5),
('PTT',          2, 8),
('BANGCHAK',     2, 8),
('ปตท',          2, 8),

-- Shopping (cat id 3)
('LAZADA',       3, 10),
('SHOPEE',       3, 10),
('AMAZON',       3, 10),
('CENTRAL',      3, 8),
('BIG C',        3, 8),
('MAKRO',        3, 8),
('LOTUS',        3, 8),
('TOPS',         3, 8),
('7-ELEVEN',     3, 8),
('TESCO',        3, 8),

-- Bills & Utilities (cat id 4)
('ELECTRICITY',  4, 10),
('WATER',        4, 8),
('INTERNET',     4, 10),
('TRUE',         4, 8),
('AIS',          4, 8),
('DTAC',         4, 8),
('INSURANCE',    4, 8),
('RENT',         4, 10),
('ค่าไฟ',        4, 10),
('ค่าน้ำ',       4, 10),

-- Healthcare (cat id 5)
('HOSPITAL',     5, 10),
('PHARMACY',     5, 8),
('CLINIC',       5, 8),
('DOCTOR',       5, 8),
('MEDICINE',     5, 8),
('DENTAL',       5, 10),
('โรงพยาบาล',    5, 10),

-- Transfer (cat id 6)
('TRANSFER',     6, 5),
('โอน',          6, 5),
('PromptPay',    6, 8),
('KRUNGTHAI',    6, 3),

-- Salary (cat id 7)
('SALARY',       7, 10),
('PAYROLL',      7, 10),
('เงินเดือน',    7, 10)

ON CONFLICT DO NOTHING;
