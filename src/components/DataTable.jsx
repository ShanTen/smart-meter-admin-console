export default function DataTable({ data }) {
    if (data.length === 0) {
      return null;
    }
  
    return (
        <table className="rounded-lg border border-separate border-tools-table-outline  border-10 w-full max-w-4xl mx-auto overflow-hidden border-gray-300 shadow-md md:w-3/4 lg:w-1/2">
            <thead className="bg-gray-100">
                <tr>
                    {Object.keys(data[0]).map((cell, index) => (
                        <th key={index} className="p-4 border-b border-gray-300 text-left font-semibold text-gray-700">
                            {cell}
                        </th>
                    ))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    data.slice(0,data.length-1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {Object.values(row).map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-4 border-b border-gray-300">
                                    {cell.toFixed(2)}
                                </td>
                            ))
                            }
                        </tr>
                    ))
                }
                {
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Total</td>
                        <td className="p-2 border-b border-gray-300">
                            ₹ {data[data.length-1].total.toFixed(2)}
                        </td>
                    </tr>
                }
            </tbody>
        </table>
    );
  }