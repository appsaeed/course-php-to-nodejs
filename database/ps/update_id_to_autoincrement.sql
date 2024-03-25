-- Step 1: Create a sequence
CREATE SEQUENCE contact_id_seq START 1;

-- Step 2: Alter the table to set the default value of the column to nextval('sequence_name')
ALTER TABLE contact ALTER COLUMN id SET DEFAULT nextval('contact_id_seq');

-- Step 3: Update existing rows to set the column value
-- This step assumes that your table already has rows and you want to update them with sequential values
-- If your table doesn't have any rows, you can skip this step
UPDATE contact SET id = nextval('contact_id_seq') WHERE id IS NULL;

-- Step 4: Set the column as NOT NULL if needed
ALTER TABLE contact ALTER COLUMN id SET NOT NULL;
