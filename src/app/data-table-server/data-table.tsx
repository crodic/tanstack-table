/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { getAllProductsClient } from '@/apis/data';
import { Loader2 } from 'lucide-react';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DataTable() {
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [sort, setSort] = useState({ sortBy: '', order: '' });
    const [searchValue, setSearchValue] = useState('');
    const { data: products, isPending } = useQuery({
        queryKey: ['products', { ...pagination, ...sort, title: searchValue }],
        queryFn: async () => {
            const res = await getAllProductsClient({ ...pagination, ...sort });
            return res.products;
        },
    });

    const table = useReactTable({
        data: products ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        initialState: {
            columnVisibility: {
                title: false,
            },
        },
    });

    return (
        <div className="rounded-md border px-4 py-2">
            <h1>Danh Sách Sản Phẩm Sort, Filter, Paginate ở server trước khi render table</h1>
            <div className="flex items-center justify-between">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Tìm theo tên sản phẩm..."
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        onClick={() => {
                                            if (!header.column.getCanSort()) return;
                                            setSort({
                                                sortBy: header.column.id,
                                                order: sort.order === 'asc' ? 'desc' : 'asc',
                                            });
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanSort() && (sort.order === 'asc' ? '▲' : '▼')}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isPending ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                <div className="flex justify-center items-center">
                                    <span className="sr-only">loading...</span>
                                    <Loader2 className="animate-spin" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
                    }}
                    // disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
                    }}
                    // disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                selected.
            </div>
        </div>
    );
}
