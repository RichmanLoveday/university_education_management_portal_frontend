<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { errorMessage, validationErrors } from "@/api/client";
import { ROLE_HOME } from "@/utils/roles";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({ email: "", password: "" });
const errors = ref({});
const formError = ref(
    route.query.expired
        ? "Your session has expired. Please sign in again."
        : "",
);
const submitting = ref(false);
const showPassword = ref(false);

const showDemoAccounts =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === "true";
const demoAccounts = [
    { label: "Super Admin", email: "superadmin@uemp.test" },
    { label: "Department Admin", email: "deptadmin.cs@uemp.test" },
    { label: "Lecturer", email: "lecturer1@uemp.test" },
    { label: "Student", email: "student1@uemp.test" },
];

function useDemo(email) {
    form.email = email;
    form.password = "password";
}

async function submit() {
    errors.value = {};
    formError.value = "";
    submitting.value = true;
    try {
        const user = await auth.login({
            email: form.email.trim(),
            password: form.password,
        });
        const redirect = route.query.redirect;
        const target =
            redirect &&
            router
                .resolve(redirect)
                .matched.some((r) => r.meta.roles?.includes(user.role));
        router.replace(target ? redirect : { name: ROLE_HOME[user.role] });
    } catch (error) {
        errors.value = validationErrors(error);
        formError.value = Object.keys(errors.value).length
            ? ""
            : errorMessage(error, "Unable to sign in.");
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <div class="grid min-h-screen lg:grid-cols-2">
        <aside
            class="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between"
        >
            <div class="flex items-center gap-3">
                <span
                    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-bold"
                    >U</span
                >
                <span class="text-lg font-semibold">UEMP</span>
            </div>
            <div>
                <h1 class="text-4xl leading-tight font-bold">
                    University Education<br />Management Portal
                </h1>
                <p class="mt-4 max-w-md text-brand-100/80">
                    Course registration, result management and departmental
                    approval in one secure portal for students, lecturers and
                    administrators.
                </p>
            </div>
            <p></p>
            <div
                class="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl"
            />
        </aside>

        <main class="flex items-center justify-center px-4 py-12 sm:px-8">
            <div class="w-full max-w-md">
                <div class="mb-8 lg:hidden">
                    <span
                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white"
                        >U</span
                    >
                </div>
                <h2 class="text-2xl font-bold text-slate-900">
                    Sign in to your account
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                    Use the credentials issued by your institution.
                </p>

                <div
                    v-if="formError"
                    class="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    role="alert"
                >
                    {{ formError }}
                </div>

                <form
                    class="mt-6 space-y-5"
                    novalidate
                    @submit.prevent="submit"
                >
                    <div>
                        <label for="email" class="label">Email address</label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            autocomplete="username"
                            required
                            class="input"
                            :class="{ 'input-error': errors.email }"
                        />
                        <p v-if="errors.email" class="field-error">
                            {{ errors.email }}
                        </p>
                    </div>
                    <div>
                        <label for="password" class="label">Password</label>
                        <div class="relative">
                            <input
                                id="password"
                                v-model="form.password"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password"
                                required
                                class="input pr-16"
                                :class="{ 'input-error': errors.password }"
                            />
                            <button
                                type="button"
                                class="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-700"
                                @click="showPassword = !showPassword"
                            >
                                {{ showPassword ? "Hide" : "Show" }}
                            </button>
                        </div>
                        <p v-if="errors.password" class="field-error">
                            {{ errors.password }}
                        </p>
                    </div>
                    <button
                        type="submit"
                        class="btn btn-primary w-full py-2.5"
                        :disabled="submitting"
                    >
                        {{ submitting ? "Signing in…" : "Sign in" }}
                    </button>
                </form>

                <div
                    v-if="showDemoAccounts"
                    class="mt-8 rounded-lg border border-dashed border-slate-300 p-4"
                >
                    <p
                        class="text-xs font-semibold tracking-wide text-slate-500 uppercase"
                    >
                        Demo accounts
                    </p>
                    <div class="mt-3 grid grid-cols-2 gap-2">
                        <button
                            v-for="account in demoAccounts"
                            :key="account.email"
                            type="button"
                            class="btn btn-secondary btn-sm"
                            @click="useDemo(account.email)"
                        >
                            {{ account.label }}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
