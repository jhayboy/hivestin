// Add automated investment processing
export async function POST() {
  try {
    await connectDB();
    const investments = await Investment.find({ status: 'active' });
    
    for (const investment of investments) {
      // Process returns
      // Update user balances
      // Send notifications
    }
  } catch (error) {
    console.error('Investment processing error:', error);
  }
} 