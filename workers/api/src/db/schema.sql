CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    client_alias TEXT,
    session_date TEXT,
    session_type TEXT,
    note_format TEXT DEFAULT 'DAP',
    status TEXT DEFAULT 'draft',
    consent_confirmed INTEGER DEFAULT 0,
    audio_final_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT
);

CREATE TABLE audio_chunks (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    storage_key TEXT NOT NULL,
    start_time REAL,
    end_time REAL,
    processed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transcript_segments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    temporary_segment_id TEXT,
    speaker_label TEXT,
    speaker_role TEXT,
    start_time REAL,
    end_time REAL,
    text TEXT,
    edited_text TEXT,
    confidence REAL,
    is_final INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_speakers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    original_speaker_label TEXT NOT NULL,
    assigned_role TEXT,
    display_name TEXT,
    confidence REAL,
    evidence_json TEXT,
    confirmed_by_user INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE highlights (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    start_time REAL,
    end_time REAL,
    highlight_type TEXT,
    severity TEXT,
    title TEXT,
    evidence_text TEXT,
    topic TEXT,
    sentiment_label TEXT,
    emotion_label TEXT,
    suggested_focus TEXT,
    suggested_technique TEXT,
    suggested_language TEXT,
    is_live INTEGER DEFAULT 0,
    is_confirmed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topic_sentiment_summaries (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    topic TEXT,
    sentiment_label TEXT,
    emotion_labels TEXT,
    intensity TEXT,
    summary TEXT,
    evidence_quotes_json TEXT,
    recommended_follow_up TEXT,
    suggested_technique TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE practitioner_technique_observations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    start_time REAL,
    end_time REAL,
    technique_type TEXT,
    observation TEXT,
    evidence_text TEXT,
    suggested_alternative TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE social_work_assessments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    client_needs_json TEXT,
    basic_needs_json TEXT,
    barriers_json TEXT,
    strengths_json TEXT,
    protective_factors_json TEXT,
    goals_json TEXT,
    resources_discussed_json TEXT,
    referrals_discussed_json TEXT,
    follow_up_tasks_json TEXT,
    safety_concerns_json TEXT,
    mandated_reporting_flags_json TEXT,
    client_preferences_json TEXT,
    cultural_context_json TEXT,
    consent_and_release_items_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE psychological_assessments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    presenting_concerns_json TEXT,
    emotional_themes_json TEXT,
    cognitive_patterns_json TEXT,
    coping_strategies_json TEXT,
    stressors_json TEXT,
    triggers_json TEXT,
    values_json TEXT,
    motivation_json TEXT,
    ambivalence_json TEXT,
    change_talk_json TEXT,
    sustain_talk_json TEXT,
    interventions_used_json TEXT,
    client_response_json TEXT,
    homework_or_practice_json TEXT,
    follow_up_items_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generated_notes (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    note_type TEXT,
    generated_json TEXT,
    edited_json TEXT,
    final_text TEXT,
    status TEXT DEFAULT 'draft',
    reviewed_at TEXT,
    signed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE note_evidence (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    transcript_segment_id TEXT,
    field_name TEXT,
    quote TEXT,
    start_time REAL,
    end_time REAL
);
