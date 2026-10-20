import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.Scanner;

public class ExpenseTracker {

    static ExpenseService expenseService = new ExpenseService();
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {

        System.out.println("==================================");
        System.out.println("     Welcome to ExpenseTracker");
        System.out.println("==================================");

        while (true) {
            System.out.println("\nMenu:");
            System.out.println("1. Add Expense");
            System.out.println("2. Display All Expenses");
            System.out.println("3. Delete Expense");
            System.out.println("4. Update Expense");
            System.out.println("5. View Total Money Spent");
            System.out.println("6. View Total Money Spent By Category");
            System.out.println("7. Search Expense By ID");
            System.out.println("8. Search By Category");
            System.out.println("9. Search By Date");
            System.out.println("10. Filter By Payment Mode");
            System.out.println("11. Find Highest Expense");
            System.out.println("12. Find Lowest Expense");
            System.out.println("13. Monthly Expense Summary");
            System.out.println("14. Sort Expenses By Amount");
            System.out.println("15. Expense Statistics");
            System.out.println("16. Exit");
            System.out.println("==================================");

            System.out.print("Select option: ");
            int choice = readInteger();

            switch (choice) {
                case 1:
                    addExpense();
                    break;
                case 2:
                    displayAllExpense();
                    break;
                case 3:
                    deleteExpense();
                    break;
                case 4:
                    editExpense();
                    break;
                case 5:
                    viewTotalMoneySpent();
                    break;
                case 6:
                    viewTotalMoneySpentByCategory();
                    break;
                case 7:
                    searchExpenseById();
                    break;
                case 8:
                    searchByCategory();
                    break;
                case 9:
                    searchByDate();
                    break;
                case 10:
                    filterByPaymentMode();
                    break;
                case 11:
                    findHighestExpense();
                    break;
                case 12:
                    findLowestExpense();
                    break;
                case 13:
                    monthlyExpenseSummary();
                    break;
                case 14:
                    sortByAmount();
                    break;
                case 15:
                    expenseStatistics();
                    break;
                case 16:
                    System.out.println("Thank you for using ExpenseTracker.");
                    System.exit(0);
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
    }

    // 1. ADD EXPENSE
    public static void addExpense() {
        System.out.println("--- Adding Expense ---");

        System.out.print("Enter Expense Name : ");
        String expenseName = sc.nextLine();

        System.out.print("Enter Expense Description : ");
        String expenseDescription = sc.nextLine();

        System.out.print("Enter Expense Amount : ");
        double expenseAmount = readPositiveDouble();

        System.out.print("Enter Expense Category : ");
        String expenseCategory = sc.nextLine();

        System.out.print("Enter ModeOfPayment : ");
        String expenseModeOfPayment = sc.nextLine();

        expenseService.addExpense(
                expenseName,
                expenseDescription,
                expenseAmount,
                expenseCategory,
                expenseModeOfPayment
        );
    }

    // 2. DISPLAY EXPENSES
    public static void displayAllExpense() {
        System.out.println("--- All Expenses ---");
        expenseService.displayData();
    }

    // 3. DELETE EXPENSE
    public static void deleteExpense() {
        System.out.print("Enter Expense ID for Deletion : ");
        int id = readInteger();
        expenseService.deleteExpense(id);
    }

    // 4. UPDATE EXPENSE
    public static void editExpense() {
        System.out.print("Enter Expense ID for Updation : ");
        int id = readInteger();

        ExpenseData expense = expenseService.findExpense(id);
        if (expense == null) {
            System.out.println("Expense Not Found");
            return;
        }

        System.out.print("Update the Expense Description : ");
        String expenseDescription = sc.nextLine();

        System.out.print("Update the Amount : ");
        double expenseAmount = readPositiveDouble();

        expenseService.editExpense(id, expenseDescription, expenseAmount);
    }

    // 5. VIEW TOTAL MONEY SPENT
    public static void viewTotalMoneySpent() {
        expenseService.viewTotalMoneySpent();
    }

    // 6. VIEW TOTAL BY CATEGORY
    public static void viewTotalMoneySpentByCategory() {
        expenseService.viewTotalMoneySpentByCategory();
    }

    // 7. SEARCH BY ID
    public static void searchExpenseById() {
        System.out.print("Enter Expense ID: ");
        int id = readInteger();
        expenseService.searchExpenseById(id);
    }

    // 8. SEARCH BY CATEGORY
    public static void searchByCategory() {
        System.out.print("Enter Category: ");
        String category = sc.nextLine();
        expenseService.searchByCategory(category);
    }

    // 9. SEARCH BY DATE
    public static void searchByDate() {
        System.out.print("Enter Date (yyyy-MM-dd): ");
        String dateInput = sc.nextLine();

        try {
            LocalDate date = LocalDate.parse(dateInput.trim());
            expenseService.searchByDate(date);
        } catch (DateTimeParseException e) {
            System.out.println("Invalid date format. Please use yyyy-MM-dd.");
        }
    }

    // 10. FILTER BY PAYMENT MODE
    public static void filterByPaymentMode() {
        System.out.print("Enter Mode Of Payment: ");
        String paymentMode = sc.nextLine();
        expenseService.filterByPaymentMode(paymentMode);
    }

    // 11. HIGHEST EXPENSE
    public static void findHighestExpense() {
        expenseService.findHighestExpense();
    }

    // 12. LOWEST EXPENSE
    public static void findLowestExpense() {
        expenseService.findLowestExpense();
    }

    // 13. MONTHLY SUMMARY
    public static void monthlyExpenseSummary() {
        System.out.print("Enter Month (yyyy-MM): ");
        String monthInput = sc.nextLine();

        try {
            YearMonth month = YearMonth.parse(monthInput.trim());
            expenseService.monthlyExpenseSummary(month);
        } catch (DateTimeParseException e) {
            System.out.println("Invalid month format. Please use yyyy-MM.");
        }
    }

    // 14. SORT BY AMOUNT
    public static void sortByAmount() {
        expenseService.sortByAmount();
    }

    // 15. EXPENSE STATISTICS
    public static void expenseStatistics() {
        expenseService.expenseStatistics();
    }

    // =====================================================
    // INPUT VALIDATION HELPERS
    // =====================================================
    public static int readInteger() {
        while (true) {
            String input = sc.nextLine();
            try {
                return Integer.parseInt(input.trim());
            } catch (NumberFormatException e) {
                System.out.print("Please enter a valid integer: ");
            }
        }
    }

    public static double readPositiveDouble() {
        while (true) {
            String input = sc.nextLine();
            try {
                double number = Double.parseDouble(input.trim());
                if (number > 0) {
                    return number;
                }
                System.out.print("Amount must be greater than 0. Enter again: ");
            } catch (NumberFormatException e) {
                System.out.print("Please enter a valid amount: ");
            }
        }
    }
}