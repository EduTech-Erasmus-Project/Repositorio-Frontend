/**
 * Archivo físico o integración técnica asociada al OA persistido.
 */
export interface LearningObjectFile {
    id?: number;
    created?: Date;
    modified?: Date;
    file?: string;
    url?: string;
    file_name?: string;
    file_size?: number;
    oa_integration_id?: number | null;
    oa_created_at?: string | null;
    oa_expires_at?: string | null;
    oa_preview_origin?: string | null;
    oa_preview_adapted?: boolean | null;
    oa_oer_adap_url?: string | null;
}
