import { useState } from 'react';
import { AppwriteException } from 'appwrite';

import { createCategory, deleteCategory } from '../services/categories';

type UseCreateCategoryType = [
	(
		establishmentId: string,
		name: string,
		order: number,
		onDone?: () => void
	) => void,
	boolean,
	AppwriteException | null
];

export const useCreateCategory = (): UseCreateCategoryType => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<AppwriteException | null>(null);

	async function handleCreate(
		establishmentId: string,
		name: string,
		order: number,
		onDone?: () => void
	) {
		try {
			setLoading(true);
			setError(null);
			await createCategory(
				establishmentId,
				name,
				order
			);
			onDone?.();
		} catch (error) {
			setError(error as AppwriteException);
		} finally {
			setLoading(false);
		}
	}

	return [handleCreate, loading, error];
}

type UseDeleteCategoryType = [
	(id: string, onDone?: () => void) => void,
	boolean,
	AppwriteException | null
];

export const useDeleteCategory = (): UseDeleteCategoryType => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<AppwriteException | null>(null);

	async function handleDelete(id: string, onDone?: () => void) {
		try {
			setLoading(true);
			setError(null);
			await deleteCategory(id);
			onDone?.();
		} catch (error) {
			setError(error as AppwriteException);
		} finally {
			setLoading(false);
		}
	}

	return [handleDelete, loading, error];
}
