import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

public class ExpenseService {

    private List<ExpenseData> expenseList = new ArrayList<>();
    private ExpenseFileFormat fileHandler;
    private int nextId = 1;

    public ExpenseService() {
        fileHandler = new ExpenseFileFormat();
        expenseList = fileHandler.loadExpensesFromFile();

        for (ExpenseData expense : expenseList) {
            if (expense.getId() >= nextId) {
                nextId = expense.getId() + 1;
            }
        }
    }

    public void addExpense(String name, String description, double amount, String category, String modeOfPayment) {
        ExpenseData expense = new ExpenseData(
                nextId,
                name,
                description,
                amount,
                LocalDate.now(),
                category,
                modeOfPayment
        );

        expenseList.add(expense);
        fileHandler.saveExpenseToFile(expense);
        nextId++;

        System.out.println("Expense Added Successfully");
    }

    // Overload for integer amount
    public void addExpense(String name, String description, int amount, String category, String modeOfPayment) {
        addExpense(name, description, (double) amount, category, modeOfPayment);
    }

    public void displayData() {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }
        for (ExpenseData expense : expenseList) {
            System.out.println(expense);
        }
    }

    public ExpenseData findExpense(int id) {
        for (ExpenseData expense : expenseList) {
            if (expense.getId() == id) {
                return expense;
            }
        }
        return null;
    }

    // Delete Expense
    public void deleteExpense(int id) {
        ExpenseData expense = findExpense(id);

        if (expense == null) {
            System.out.println("Expense Not Found");
            return;
        }

        expenseList.remove(expense);
        fileHandler.saveAllExpensesToFile(expenseList);
        System.out.println("Expense deleted successfully.");
    }

    // Update Expense
    public void editExpense(int id, String expenseDescription, double expenseAmount) {
        ExpenseData expense = findExpense(id);

        if (expense == null) {
            System.out.println("Expense Not Found");
            return;
        }

        expense.setDescription(expenseDescription);
        expense.setAmount(expenseAmount);
        fileHandler.saveAllExpensesToFile(expenseList);
        System.out.println("Expense updated successfully.");
    }

    public void editExpense(int id, String expenseDescription, int expenseAmount) {
        editExpense(id, expenseDescription, (double) expenseAmount);
    }

    // VIEW TOTAL MONEY SPENT
    public void viewTotalMoneySpent() {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }

        double total = 0.0;
        for (ExpenseData expense : expenseList) {
            total += expense.getAmount();
        }

        System.out.printf(Locale.US, "Total Money Spent: %.2f%n", total);
    }

    public void viewTotalMoneySpentByCategory() {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }

        Map<String, Double> categoryTotals = new HashMap<>();
        for (ExpenseData expense : expenseList) {
            String category = expense.getCategory();
            double amount = expense.getAmount();
            categoryTotals.put(category, categoryTotals.getOrDefault(category, 0.0) + amount);
        }

        System.out.println("--- Total Money Spent By Category ---");
        for (Map.Entry<String, Double> entry : categoryTotals.entrySet()) {
            System.out.printf(Locale.US, "%s: %.2f%n", entry.getKey(), entry.getValue());
        }
    }

    // =====================================================
    // 7. SEARCH EXPENSE BY ID
    // =====================================================
    public void searchExpenseById(int id) {
        ExpenseData expense = findExpense(id);

        if (expense == null) {
            System.out.println("Expense Not Found");
            return;
        }

        System.out.println("--- Expense Found ---");
        System.out.println(expense);
    }

    // =====================================================
    // 8. SEARCH BY CATEGORY
    // =====================================================
    public void searchByCategory(String category) {
        boolean found = false;
        System.out.println("--- Expenses in Category: " + category + " ---");

        for (ExpenseData expense : expenseList) {
            if (expense.getCategory().equalsIgnoreCase(category)) {
                System.out.println(expense);
                found = true;
            }
        }

        if (!found) {
            System.out.println("No expenses found for this category.");
        }
    }

    // =====================================================
    // 9. SEARCH BY DATE
    // =====================================================
    public void searchByDate(LocalDate date) {
        boolean found = false;
        System.out.println("--- Expenses on: " + date + " ---");

        for (ExpenseData expense : expenseList) {
            if (expense.getExpenseDate().equals(date)) {
                System.out.println(expense);
                found = true;
            }
        }

        if (!found) {
            System.out.println("No expenses found for this date.");
        }
    }

    // =====================================================
    // 10. FILTER BY PAYMENT MODE
    // =====================================================
    public void filterByPaymentMode(String paymentMode) {
        boolean found = false;
        System.out.println("--- Payment Mode: " + paymentMode + " ---");

        for (ExpenseData expense : expenseList) {
            if (expense.getModeOfPayment().equalsIgnoreCase(paymentMode)) {
                System.out.println(expense);
                found = true;
            }
        }

        if (!found) {
            System.out.println("No expenses found for this payment mode.");
        }
    }

    // =====================================================
    // 11. HIGHEST EXPENSE
    // =====================================================
    public void findHighestExpense() {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }

        ExpenseData highest = expenseList.get(0);
        for (ExpenseData expense : expenseList) {
            if (expense.getAmount() > highest.getAmount()) {
                highest = expense;
            }
        }

        System.out.println("--- Highest Expense ---");
        System.out.println(highest);
    }

    // =====================================================
    // 12. LOWEST EXPENSE
    // =====================================================
    public void findLowestExpense() {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }

        ExpenseData lowest = expenseList.get(0);
        for (ExpenseData expense : expenseList) {
            if (expense.getAmount() < lowest.getAmount()) {
                lowest = expense;
            }
        }

        System.out.println("--- Lowest Expense ---");
        System.out.println(lowest);
    }

    // =====================================================
    // 13. MONTHLY EXPENSE SUMMARY
    // =====================================================
    public void monthlyExpenseSummary(YearMonth month) {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }

        double total = 0.0;
        int count = 0;

        System.out.println("--- Monthly Expense Summary: " + month + " ---");

        for (ExpenseData expense : expenseList) {
            YearMonth expenseMonth = YearMonth.from(expense.getExpenseDate());

            if (expenseMonth.equals(month)) {
                System.out.println(expense);
                total += expense.getAmount();
                count++;
            }
        }

        if (count == 0) {
            System.out.println("No expenses found for this month.");
            return;
        }

        System.out.println("Number of Expenses: " + count);
        System.out.printf(Locale.US, "Total Spent: %.2f%n", total);
    }

    // =====================================================
    // 14. SORT BY AMOUNT
    // =====================================================
    public void sortByAmount() {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }

        // Sort from highest amount to lowest
        expenseList.sort(Comparator.comparingDouble(ExpenseData::getAmount).reversed());

        System.out.println("--- Expenses Sorted By Amount ---");
        displayData();
    }

    // =====================================================
    // 15. EXPENSE STATISTICS
    // =====================================================
    public void expenseStatistics() {
        if (expenseList.isEmpty()) {
            System.out.println("No expenses found.");
            return;
        }

        double total = 0.0;
        double highest = expenseList.get(0).getAmount();
        double lowest = expenseList.get(0).getAmount();

        for (ExpenseData expense : expenseList) {
            double amount = expense.getAmount();
            total += amount;

            if (amount > highest) {
                highest = amount;
            }

            if (amount < lowest) {
                lowest = amount;
            }
        }

        double average = total / expenseList.size();

        System.out.println("--- Expense Statistics ---");
        System.out.println("Number of Expenses: " + expenseList.size());
        System.out.printf(Locale.US, "Total Expense: %.2f%n", total);
        System.out.printf(Locale.US, "Average Expense: %.2f%n", average);
        System.out.printf(Locale.US, "Highest Expense: %.2f%n", highest);
        System.out.printf(Locale.US, "Lowest Expense: %.2f%n", lowest);
    }
}
