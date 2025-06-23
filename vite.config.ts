import { defineConfig } from 'vite';

export default defineConfig(() => {
	return {
		resolve: {
			alias: {
				src: '/src',
			},
		},
	};
});
