-- Create health_metrics table
CREATE TABLE IF NOT EXISTS public.health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('steps', 'heart_rate', 'blood_pressure', 'glucose')),
    value TEXT NOT NULL,
    unit TEXT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON public.health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_metric_type ON public.health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON public.health_metrics(recorded_at);

-- RLS Policies
-- Users can view their own metrics
CREATE POLICY "Users can view their own health metrics"
    ON public.health_metrics
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Family members can view metrics of connected seniors (with permission)
CREATE POLICY "Family can view connected senior health metrics"
    ON public.health_metrics
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM family_connections
            WHERE family_connections.senior_id = health_metrics.user_id
            AND family_connections.family_member_id = auth.uid()
            AND family_connections.status = 'accepted'
            AND family_connections.health_metrics_access = true
        )
    );

-- Users can insert their own metrics
CREATE POLICY "Users can insert their own health metrics"
    ON public.health_metrics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own metrics
CREATE POLICY "Users can update their own health metrics"
    ON public.health_metrics
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can delete their own metrics
CREATE POLICY "Users can delete their own health metrics"
    ON public.health_metrics
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
DROP TRIGGER IF EXISTS update_health_metrics_updated_at ON public.health_metrics;
CREATE TRIGGER update_health_metrics_updated_at
BEFORE UPDATE ON public.health_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
