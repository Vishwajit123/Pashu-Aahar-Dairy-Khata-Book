import java.io.*;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ExpenseFileFormat {

    private final String FILE_NAME = "expense.txt";

    // Convert ExpenseData object to String
    private String convertToFileFormat(ExpenseData expenseData) {
        return expenseData.getId() + "|" +
                expenseData.getExpenseName() + "|" +
                expenseData.getDescription() + "|" +
                String.format(Locale.US, "%.2f", expenseData.getAmount()) + "|" +
                expenseData.getExpenseDate() + "|" +
                expenseData.getCategory() + "|" +
                expenseData.getModeOfPayment();
    }

    // Save ONE expense
    public void saveExpenseToFile(ExpenseData expenseData) {
        try (BufferedWriter bufferedWriter =
                     new BufferedWriter(
                             new FileWriter(FILE_NAME, true))) {

            String line = convertToFileFormat(expenseData);
            bufferedWriter.write(line);
            bufferedWriter.newLine();
            bufferedWriter.flush();

        } catch (IOException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }
    }

    // Save ALL expenses
    public void saveAllExpensesToFile(List<ExpenseData> expenseDataList) {
        try (BufferedWriter bufferedWriter =
                     new BufferedWriter(
                             new FileWriter(FILE_NAME))) {

            for (ExpenseData expenseData : expenseDataList) {
                String line = convertToFileFormat(expenseData);
                bufferedWriter.write(line);
                bufferedWriter.newLine();
            }
            bufferedWriter.flush();

        } catch (IOException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }
    }

    // Load expenses from file
    public List<ExpenseData> loadExpensesFromFile() {
        List<ExpenseData> list = new ArrayList<>();
        File file = new File(FILE_NAME);

        System.out.println("Reading expenses from file: " + file.getAbsolutePath());

        if (!file.exists()) {
            return list;
        }

        try (BufferedReader bufferedReader = new BufferedReader(new FileReader(file))) {
            String line;
            int lineNumber = 0;

            while ((line = bufferedReader.readLine()) != null) {
                lineNumber++;
                String trimmedLine = line.trim();
                if (trimmedLine.isEmpty()) {
                    continue;
                }

                String[] part = line.split("\\|", -1);
                if (part.length != 7) {
                    System.out.println("Invalid expense data on line " + lineNumber + ": " + line);
                    continue;
                }

                try {
                    int id = Integer.parseInt(part[0].trim());
                    String name = part[1].trim();
                    String description = part[2].trim();
                    double amount = Double.parseDouble(part[3].trim());
                    LocalDate date = LocalDate.parse(part[4].trim());
                    String category = part[5].trim();
                    String modeOfPayment = part[6].trim();

                    ExpenseData expenseData = new ExpenseData(
                            id,
                            name,
                            description,
                            amount,
                            date,
                            category,
                            modeOfPayment
                    );

                    list.add(expenseData);
                } catch (NumberFormatException | DateTimeParseException e) {
                    System.out.println("Invalid data format on line " + lineNumber + ": " + e.getMessage());
                }
            }

        } catch (IOException e) {
            System.out.println("Error in reading file: " + e.getMessage());
        }

        return list;
    }
}