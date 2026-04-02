app.post('/book_event', (req, res) => {
  const { userId, eventType, packageType, preferredDate, guestCount, selectedDishes, notes } = req.body;
  
  // Automatically determine the cost based on the package!
  let totalCost = 30000;
  if (packageType === 'Package 2') totalCost = 40000;
  if (packageType === 'Package 3') totalCost = 55000;

  // Insert the total_cost into the database alongside everything else
  db.query(`INSERT INTO appointments (user_id, event_type, package_type, preferred_date, guest_count, selected_dishes, required_inventory, notes, status, total_cost) VALUES (?, ?, ?, ?, ?, ?, '', ?, 'Pending', ?)`, 
  [userId, eventType, packageType, preferredDate, guestCount, selectedDishes, notes || '', totalCost], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    return res.json({ success: true, message: "Event booking successful!", booking_id: result.insertId });
  });
});