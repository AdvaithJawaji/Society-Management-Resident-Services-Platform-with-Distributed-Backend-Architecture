USE society_management;

DELIMITER //

-- Trigger to update bill status after successful payment
CREATE TRIGGER after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE v_total_paid DECIMAL(10,2);
    DECLARE v_bill_amount DECIMAL(10,2);
    
    -- Get total payments for this bill
    SELECT SUM(amount) INTO v_total_paid FROM payments WHERE bill_id = NEW.bill_id;
    
    -- Get bill amount
    SELECT amount INTO v_bill_amount FROM maintenance_bills WHERE id = NEW.bill_id;
    
    -- Update status if fully paid
    IF v_total_paid >= v_bill_amount THEN
        UPDATE maintenance_bills SET status = 'PAID' WHERE id = NEW.bill_id;
    END IF;
END //

-- Trigger to auto-set resolved_date when complaint status changes to RESOLVED
CREATE TRIGGER before_complaint_update
BEFORE UPDATE ON complaints
FOR EACH ROW
BEGIN
    IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' THEN
        SET NEW.resolved_date = CURRENT_TIMESTAMP;
    END IF;
END //

DELIMITER ;
