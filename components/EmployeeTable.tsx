"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

type Employee = {
  id?: number;
  first_name: string;
  last_name: string;
  position: string;
  phone: string;
  email: string;
};

const EmployeeTable = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [initialEmployees, setInitialEmployees] = useState<Employee[]>([]);
  const [newEmployees, setNewEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Employee>("id");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [page, filter, sortField, sortOrder]);

  useEffect(() => {
    setIsAllSelected(
      employees.length > 0 && selectedIds.length === employees.length
    );
  }, [selectedIds, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3001/employees", {
        params: {
          page,
          limit: 5,
          sort: sortField,
          order: sortOrder,
          filter,
        },
      });

      setEmployees(response.data.data);
      setInitialEmployees(response.data.data);
      setTotalPages(Math.ceil(response.data.count / 5));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleAddRow = () => {
    setNewEmployees([
      ...newEmployees,
      { first_name: "", last_name: "", position: "", phone: "", email: "" },
    ]);
  };

  const handleDeleteRow = () => {
    setNewEmployees(newEmployees.slice(0, -1));
  };

  const handleInputChange = (
    index: number,
    field: keyof Employee,
    value: string,
    isNew: boolean
  ) => {
    if (isNew) {
      const updatedNewEmployees = [...newEmployees];
      updatedNewEmployees[index] = {
        ...updatedNewEmployees[index],
        [field]: value,
      };
      setNewEmployees(updatedNewEmployees);
    } else {
      const updatedEmployees = [...employees];
      updatedEmployees[index] = {
        ...updatedEmployees[index],
        [field]: value,
      };
      setEmployees(updatedEmployees);
    }
  };

  const handleSave = async () => {
    try {
      const editedEmployees = employees.filter((emp) => {
        const originalEmployee = initialEmployees.find((e) => e.id === emp.id);
        return (
          originalEmployee &&
          Object.keys(emp).some(
            (key) =>
              emp[key as keyof Employee] !==
              originalEmployee[key as keyof Employee]
          )
        );
      });

      console.log("New Employees: ", newEmployees);
      console.log("Edited Employees: ", editedEmployees);

      if (newEmployees.length > 0) {
        await axios.post("http://localhost:3001/employees/add", newEmployees);
      }

      if (editedEmployees.length > 0) {
        await axios.put(
          "http://localhost:3001/employees/edit",
          editedEmployees
        );
      }

      setNewEmployees([]);
      setInitialEmployees(employees);
      fetchEmployees();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Employees updated successfully",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "An unexpected error occurred",
      });
    }
  };

  const handleSort = (field: keyof Employee) => {
    setSortField(field);
    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id]
    );
  };

  const handleHeaderCheckboxChange = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((emp) => emp.id!));
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedIds.length > 0) {
        await axios.delete("http://localhost:3001/employees/delete", {
          data: { ids: selectedIds },
        });

        fetchEmployees();
        setSelectedIds([]);
        setIsAllSelected(false);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Employees deleted successfully",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "An unexpected error occurred",
      });
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const isSaveEnabled =
    newEmployees.length > 0 ||
    employees.some((emp, index) => {
      const originalEmployee = initialEmployees.find((e) => e.id === emp.id);
      return (
        originalEmployee &&
        Object.keys(emp).some(
          (key) =>
            emp[key as keyof Employee] !==
            originalEmployee[key as keyof Employee]
        )
      );
    });

  const isDeleteEnabled = selectedIds.length > 0;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Employee Table</h1>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-4 px-4 py-2 border rounded-md flex-1 sm:max-w-xs"
        />
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={handleAddRow}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
          <button
            onClick={handleDeleteRow}
            className="px-4 py-2 bg-red-500 text-white rounded-md disabled:bg-red-300"
            disabled={newEmployees.length === 0}
          >
            Delete Add Last Row
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-green-300"
            disabled={!isSaveEnabled}
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md disabled:bg-red-300"
            disabled={!isDeleteEnabled}
          >
            Delete Selected
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleHeaderCheckboxChange}
                />
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("first_name")}
              >
                First Name
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("last_name")}
              >
                Last Name
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("position")}
              >
                Position
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("phone")}
              >
                Phone
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {newEmployees.map((emp, index) => (
              <tr key={`new-${index}`}>
                <td className="border p-2"></td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.first_name}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "first_name",
                        e.target.value,
                        true
                      )
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.last_name}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "last_name",
                        e.target.value,
                        true
                      )
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.position}
                    onChange={(e) =>
                      handleInputChange(index, "position", e.target.value, true)
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.phone}
                    onChange={(e) =>
                      handleInputChange(index, "phone", e.target.value, true)
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.email}
                    onChange={(e) =>
                      handleInputChange(index, "email", e.target.value, true)
                    }
                    className="border p-2 w-full"
                  />
                </td>
              </tr>
            ))}
            {employees.map((emp, index) => (
              <tr key={emp.id}>
                <td className="border p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(emp.id!)}
                    onChange={() => handleCheckboxChange(emp.id!)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.first_name}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "first_name",
                        e.target.value,
                        false
                      )
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.last_name}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "last_name",
                        e.target.value,
                        false
                      )
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.position}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "position",
                        e.target.value,
                        false
                      )
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.phone}
                    onChange={(e) =>
                      handleInputChange(index, "phone", e.target.value, false)
                    }
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={emp.email}
                    onChange={(e) =>
                      handleInputChange(index, "email", e.target.value, false)
                    }
                    className="border p-2 w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button
          onClick={goToPreviousPage}
          className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md disabled:bg-gray-300"
          disabled={page <= 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setPage(index + 1)}
            className={`mx-1 px-4 py-2 border rounded-md ${
              page === index + 1
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={goToNextPage}
          className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md disabled:bg-gray-300"
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeTable;
