<script module lang="ts">
	import { fade } from "svelte/transition";

	interface Toast {
		id: number;
		duration: number;
		msg: string;
		onEnd?: () => void;
	}

	interface Options {
		duration?: number;
		onEnd?: () => void;
	}

	let toasts = $state<Toast[]>([]);
	let counter = $state(0);

	export function push(msg: string, options?: Options) {
		counter++;
		const id = counter;
		const duration = options?.duration ?? 5000;
		toasts.push({ id, msg, duration, onEnd: options?.onEnd });
		setTimeout(() => {
			cancel(id);
		}, duration);
		return id;
	}
	export function cancel(id: number) {
		toasts = toasts.filter((value) => {
			const eq = value.id == id;
			if (eq && value.onEnd) {
				value.onEnd();
			}
			return !eq;
		});
	}
</script>

<div class="fixed right-0 top-0 z-50 flex flex-col gap-2 p-2">
	{#each toasts as toast}
		<div transition:fade class="flex gap-2 rounded-md bg-slate-800 p-2 text-white">
			<p>{toast.msg}</p>
			<button onclick={() => cancel(toast.id)} class=" h-5 w-5 rounded-md bg-red-800">X</button>
		</div>
	{/each}
</div>
