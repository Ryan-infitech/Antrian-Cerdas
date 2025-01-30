/*
  # Queue System Schema

  1. New Tables
    - `queues`
      - `id` (uuid, primary key)
      - `name` (text, queue name)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `is_active` (boolean)
      - `current_number` (integer)
    
    - `queue_entries`
      - `id` (uuid, primary key)
      - `queue_id` (uuid, references queues)
      - `number` (integer)
      - `name` (text)
      - `status` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for queue creation and management
    - Add policies for queue entry creation and viewing
*/

-- Create queues table
CREATE TABLE IF NOT EXISTS queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  is_active boolean DEFAULT true,
  current_number integer DEFAULT 0
);

-- Create queue entries table
CREATE TABLE IF NOT EXISTS queue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES queues NOT NULL,
  number integer NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'called', 'completed', 'skipped'))
);

-- Enable RLS
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- Policies for queues
CREATE POLICY "Anyone can view active queues"
  ON queues FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create queues"
  ON queues FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Queue creators can update their queues"
  ON queues FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for queue entries
CREATE POLICY "Anyone can view queue entries"
  ON queue_entries FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create queue entries"
  ON queue_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Queue creators can update entries"
  ON queue_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM queues
      WHERE queues.id = queue_entries.queue_id
      AND queues.created_by = auth.uid()
    )
  );