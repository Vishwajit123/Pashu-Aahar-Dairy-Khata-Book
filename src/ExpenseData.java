import java.time.LocalDate;
import java.util.Locale;
import java.util.Objects;

public class ExpenseData {
    private int id;
    private String expenseName;
    private String description;
    private double amount;
    private LocalDate expenseDate;
    private String category;
    private String modeOfPayment;

    public ExpenseData(int id, String expenseName, String description, double amount, LocalDate expenseDate, String category, String modeOfPayment) {
        this.id = id;
        this.expenseName = expenseName != null ? expenseName.trim() : "";
        this.description = description != null ? description.trim() : "";
        this.amount = amount;
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
        this.category = category != null ? category.trim() : "Other";
        this.modeOfPayment = modeOfPayment != null ? modeOfPayment.trim() : "Cash";
    }

    // Overloaded constructor for backwards compatibility with integer amounts
    public ExpenseData(int id, String expenseName, String description, int amount, LocalDate expenseDate, String category, String modeOfPayment) {
        this(id, expenseName, description, (double) amount, expenseDate, category, modeOfPayment);
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getExpenseName() {
        return expenseName;
    }

    public void setExpenseName(String expenseName) {
        this.expenseName = expenseName != null ? expenseName.trim() : "";
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description != null ? description.trim() : "";
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category != null ? category.trim() : "Other";
    }

    public String getModeOfPayment() {
        return modeOfPayment;
    }

    public void setModeOfPayment(String modeOfPayment) {
        this.modeOfPayment = modeOfPayment != null ? modeOfPayment.trim() : "Cash";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExpenseData that)) return false;
        return id == that.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ID: " + id +
                ", Expense Name: " + expenseName +
                ", Description: " + description +
                ", Amount: " + String.format(Locale.US, "%.2f", amount) +
                ", Date: " + expenseDate +
                ", Category: " + category +
                ", Mode of Payment: " + modeOfPayment;
    }
}
