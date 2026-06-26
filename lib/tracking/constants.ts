// Parâmetros centrais do pipeline de GPS — fáceis de ajustar.
export const TRACKING_MIN_INTERVAL_MS = 5000 // intervalo mínimo entre pontos enviados
export const TRACKING_MIN_DISTANCE_METERS = 8 // ou envia antes se andou mais que isso
export const TRACKING_MAX_ACCURACY_METERS = 35 // pior precisão aceita no cálculo principal
export const TRACKING_MAX_SPEED_MPS = 12 // ~43 km/h: acima disso é salto impossível pra corrida
export const TRACKING_MAX_POINTS_PER_REQUEST = 300 // anti-payload excessivo
export const TRACKING_DEDUPE_MIN_METERS = 1 // pontos colados demais = duplicado
export const TRACKING_DEDUPE_MIN_SECONDS = 1
