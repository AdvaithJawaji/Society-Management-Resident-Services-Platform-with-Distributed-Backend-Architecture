USE society_management;

DELIMITER //

CREATE PROCEDURE GenerateMonthlyMaintenanceBills(
    IN p_billing_month DATE,
    IN p_due_date DATE,
    IN p_2bhk_amount DECIMAL(10,2),
    IN p_3bhk_amount DECIMAL(10,2)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_flat_id INT;
    DECLARE v_type VARCHAR(20);
    DECLARE v_amount DECIMAL(10,2);
    
    DECLARE flat_cursor CURSOR FOR SELECT id, type FROM flats;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Transaction to ensure all or nothing
    START TRANSACTION;
    
    OPEN flat_cursor;
    
    read_loop: LOOP
        FETCH flat_cursor INTO v_flat_id, v_type;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        IF v_type = '2BHK' THEN
            SET v_amount = p_2bhk_amount;
        ELSEIF v_type = '3BHK' THEN
            SET v_amount = p_3bhk_amount;
        ELSE
            SET v_amount = p_2bhk_amount; -- Default fallback
        END IF;
        
        -- Insert bill only if it doesn't already exist for this month
        INSERT IGNORE INTO maintenance_bills (flat_id, billing_month, amount, due_date, status)
        VALUES (v_flat_id, p_billing_month, v_amount, p_due_date, 'UNPAID');
        
    END LOOP;
    
    CLOSE flat_cursor;
    
    COMMIT;
    
END //

DELIMITER ;
