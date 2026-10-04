<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER financial_transactions_before_update
            BEFORE UPDATE ON financial_transactions
            FOR EACH ROW
            BEGIN
                IF OLD.status IN ('posted', 'reversed') AND NOT (
                    OLD.status = 'posted' AND NEW.status = 'reversed'
                    AND NEW.transaction_number = OLD.transaction_number
                    AND NEW.transaction_date = OLD.transaction_date
                    AND NEW.transaction_type = OLD.transaction_type
                    AND (NEW.source_type <=> OLD.source_type)
                    AND (NEW.source_id <=> OLD.source_id)
                    AND (NEW.package_id <=> OLD.package_id)
                    AND NEW.currency = OLD.currency
                    AND NEW.exchange_rate = OLD.exchange_rate
                    AND NEW.amount_original = OLD.amount_original
                    AND NEW.amount_idr = OLD.amount_idr
                    AND NEW.idempotency_key = OLD.idempotency_key
                    AND NEW.payload_hash = OLD.payload_hash
                    AND (NEW.reversal_of_id <=> OLD.reversal_of_id)
                    AND (NEW.adjustment_of_id <=> OLD.adjustment_of_id)
                    AND (NEW.adjustment_reason <=> OLD.adjustment_reason)
                    AND (NEW.description <=> OLD.description)
                    AND (NEW.posted_by <=> OLD.posted_by)
                    AND (NEW.posted_at <=> OLD.posted_at)
                    AND NEW.reversed_at IS NOT NULL
                ) THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaksi posted/reversed bersifat tetap; koreksi wajib melalui reversal.';
                END IF;

                IF OLD.status = 'draft' AND NEW.status = 'posted' AND (
                    (SELECT COUNT(*) FROM financial_transaction_lines WHERE financial_transaction_id = OLD.id) < 2
                    OR (SELECT COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount_idr ELSE -amount_idr END), 0) FROM financial_transaction_lines WHERE financial_transaction_id = OLD.id) <> 0
                ) THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaksi tidak dapat diposting karena baris jurnal belum seimbang.';
                END IF;
            END
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER financial_transactions_before_delete
            BEFORE DELETE ON financial_transactions
            FOR EACH ROW
            BEGIN
                IF OLD.status IN ('posted', 'reversed') THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaksi posted/reversed tidak dapat dihapus.';
                END IF;
            END
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER financial_transaction_lines_before_insert
            BEFORE INSERT ON financial_transaction_lines
            FOR EACH ROW
            BEGIN
                IF COALESCE((SELECT status FROM financial_transactions WHERE id = NEW.financial_transaction_id), 'missing') <> 'draft' THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Baris hanya dapat ditambahkan pada transaksi draft.';
                END IF;
            END
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER financial_transaction_lines_before_update
            BEFORE UPDATE ON financial_transaction_lines
            FOR EACH ROW
            BEGIN
                IF COALESCE((SELECT status FROM financial_transactions WHERE id = OLD.financial_transaction_id), 'missing') <> 'draft' THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Baris transaksi posted/reversed tidak dapat diubah.';
                END IF;
            END
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER financial_transaction_lines_before_delete
            BEFORE DELETE ON financial_transaction_lines
            FOR EACH ROW
            BEGIN
                IF COALESCE((SELECT status FROM financial_transactions WHERE id = OLD.financial_transaction_id), 'missing') <> 'draft' THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Baris transaksi posted/reversed tidak dapat dihapus.';
                END IF;
            END
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS financial_transaction_lines_before_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS financial_transaction_lines_before_update');
        DB::unprepared('DROP TRIGGER IF EXISTS financial_transaction_lines_before_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS financial_transactions_before_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS financial_transactions_before_update');
    }
};
