import http from "./http";


export interface AuthResponse<TUser = any> {
    status: number
    access_token: string
    refresh_token: string
    user: TUser
    message?: string
}

export interface LogoutResponse {
    success: boolean;
    message: string;
};

export interface PaginatedResponse<T> {
    data: T[]
    meta?: {
        page: number
        limit: number
        total: number
    }
}


/*
==========================
Auth
==========================
*/

export const LoginUser = async (
    payload: { email: string; password: string }
): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(
        "/auth/login/user",
        payload
    )

    return response.data
}

export const LoginAlumni = async (
    payload: { matric_number: string }
): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(
        "/auth/login/alumni",
        payload
    )

    return response.data
}

export const logout = async (
    accessToken: string,
    user: any
): Promise<LogoutResponse> => {
    const response = await http.post(
        "auth/logout",
        { user },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return response.data;
};

export const getProfile = async () => {
    const response = await http.get("auth/profile");
    return response.data;
};

type UpdateProfileDto = {
    firstname?: string;
    lastname?: string;
    email?: string;
    bio?: string;
};

export const updateProfile = async (
    data: UpdateProfileDto,
) => {
    const response = await http.patch("auth/profile", data);

    return response.data;
};

type ChangePasswordDto = {
    currentPassword: string;
    newPassword: string;
};

export const changePassword = async (
    data: ChangePasswordDto,
) => {
    const response = await http.patch("auth/profile/password", data);

    return response.data;
};


/*
==========================
UPLOAD transcript
==========================
*/
export const uploadTranscript = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await http.post(
        '/upload/transcript',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    )

    return data
}


/*
==========================
UPLOAD - SIGNATURE
==========================
*/

export const postSignature = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await http.post(
        '/upload/signature',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    )

    return data
}

export const getSignature = async (id: number) => {
    const { data } = await http.get(
        `/upload/signature/${id}`,
    )
    return data?.data;
}


export const deleteSignature = async (id: number) => {
    const { data } = await http.delete(
        `/upload/signature/${id}`,
    )
    return data;
}

/*
==========================
UPLOAD - STAMP
==========================
*/

export const postStamp = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await http.post(
        '/upload/stamp',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    )

    return data
}

export const getStamp = async (id: number) => {
    const { data } = await http.get(
        `/upload/stamp/${id}`,
    )
    return data?.data;
}


export const deleteStamp = async (id: number) => {
    const { data } = await http.delete(
        `/upload/stamp/${id}`,
    )
    return data
}


/*
==========================
Stats
==========================
*/
export const adminStats = async (id: number) => {
    const { data } = await http.get(`/dashboard/admin/${id}`);
    return data;
}

export const alumniStats = async (id: number) => {
    const { data } = await http.get(`/dashboard/alumni/${id}`);
    return data;
}

export const AlumniActivityLog = async (id: number) => {
    const { data } = await http.get(`activity/user?entity=ALUMNI&actorId=${id}&page=1&limit=4`);
    return data;
}

export const AdminActivityLog = async (id: number) => {
    const { data } = await http.get(`activity/admin?entity=USER&actorId=${id}&page=1&limit=4`);
    return data;
}

export const AllActivityLog = async () => {
    const { data } = await http.get(`activity?&page=1&limit=20`);
    return data;
}


/*
==========================
Roles
==========================
*/

export interface Role {
    id: string
    name: string
    createdAt: string
    _count: {
        users: number
    }
}

export const getRoles = async (
    param: { page: number; limit: number }
): Promise<PaginatedResponse<Role>> => {
    const { data } = await http.get(`/role`, {
        params: {
            page: param.page,
            limit: param.limit,
        },
    });

    return data;
};

export const createRole = async (payload: { name: string }) => {
    const { data } = await http.post(`/role`, payload);
    return data;
}

export const getRole = async (id: number) => {
    const { data } = await http.get(`/role/${id}`);
    return data;
}

export const updateRole = async (id: number, payload: { name: string }) => {
    const { data } = await http.patch(`/role/${id}`, payload);
    return data;
}

export const deleteRole = async (id: number) => {
    const { data } = await http.delete(`/role/${id}`);
    return data;
}


/*
==========================
Admins 
==========================
*/

export interface Admin {
    id: string
    firstname: string
    lastname: string
    email: string
    role: { id: number, name: string }
    isActive: boolean
}

export const createUser = async (payload: {
    firstname: string;
    lastname: string;
    roleId: number;
    email: string;
    password: string;
}) => {
    const { data } = await http.post("/user", payload);
    return data;
}

export const getAdmins = async (params: { page: number, limit: number }): Promise<PaginatedResponse<Admin>> => {
    const { data } = await http.get(`/user`, {
        params: {
            page: params.page,
            limit: params.limit,
        }
    });
    return data;
}

export const updateUser = async (id: number, payload: {
    firstname: string
    lastname: string
    email: string
    roleId: number
    isActive: boolean
}) => {
    const response = await http.patch(`/user/${id}`, payload)
    return response.data
}

export const deleteUser = async (id: number) => {
    try {
        const response = await http.delete(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error('An Error Occoured: ', error)
    }
}


/*
==========================
Users 
==========================
*/

export interface User {
    id: string
    firstname: string
    lastname: string
    email: string
    isActive: boolean
    _count: {
        requests: number
    }
}

export const getUsers = async (params: string): Promise<PaginatedResponse<User>> => {
    const { data } = await http.get(`/alumni?${params}`);
    return data;
}

export const getUserProfile = async (id: number) => {
    const { data } = await http.get(`/alumni/${id}`);
    return data;
}


/*
==========================
Documents
==========================
*/

export interface Document {
    id: string
    title: string
    createdBy: { email: string }
    amount: number
    totalAmount: number
    status: 'pending' | 'processing' | 'success' | 'failed'
    createdAt: string
}

export const createDocument = async (payload: {
    title: string;
    description?: string;
    status: string;
    createdById: number;
    price: number;
    processingFee: number;
    approvalChainId: number;
}) => {
    const { data } = await http.post("/documents", payload);
    return data;
}

export const getDocuments = async (params?: string): Promise<PaginatedResponse<Document>> => {
    const { data } = await http.get(`/documents?${params}`);
    return data;
}
export const getDocument = async (id: number) => {
    const { data } = await http.get(`/documents/${id}`);
    return data;
}

export const deleteDocument = async (id: number) => {
    try {
        const response = await http.delete(`/documents/${id}`);
        return response.data;
    } catch (error) {
        console.error('An Error Occoured: ', error)
    }
}



/*
==========================
Faculty
==========================
*/

export interface Faculty {
    id: string
    name: string
    createdBy: { email: string }
    createdAt: string
    _count: {
        departments: number
    }
}

export const createFaculty = async (payload: {
    name: string;
    createdById: number;
}) => {
    const { data } = await http.post("/faculty", payload);
    return data;
}

export const getFaculties = async (params: string): Promise<PaginatedResponse<Faculty>> => {
    const { data } = await http.get(`/faculty?${params}`);
    return data;
}
export const updateFaculty = async (id: number, payload: {
    name: string;
    createdById: number;
}) => {
    const { data } = await http.patch(`/faculty/${id}`, payload);
    return data;
}

export const deleteFaculty = async (id: number) => {
    try {
        const response = await http.delete(`/faculty/${id}`);
        return response.data;
    } catch (error) {
        console.error('An Error Occoured: ', error)
    }
}

/*
==========================
Department
==========================
*/

export interface Department {
    id: string
    name: string
    faculty: { id: number, name: string }
    createdBy: { email: string }
    createdAt: string
}

export const createDepartment = async (payload: {
    name: string;
    createdById: number;
}) => {
    const { data } = await http.post("/department", payload);
    return data;
}

export const getDepartments = async (params: string): Promise<PaginatedResponse<Department>> => {
    const { data } = await http.get(`/department?${params}`);
    return data;
}

export const updateDepartment = async (id: number, payload: {
    name: string;
    createdById: number;
}) => {
    const { data } = await http.patch(`/department/${id}`, payload);
    return data;
}


export const deleteDepartment = async (id: number) => {
    try {
        const response = await http.delete(`/department/${id}`);
        return response.data;
    } catch (error) {
        console.error('An Error Occoured: ', error)
    }
}

/*
==========================
Requests
==========================
*/

export interface Request {
    id: number
    status: string
    reference_number: string
    type: string
    user: {
        id: number
        firstname: string
        lastname: string
        matric_number: string
        email: string
    }
    document: {
        id: number
        title: string
        totalAmount: number
    }
    payments: {
        id: string
        status: string
        reference: string
    }[]
    createdAt: string
}

export const createRequests = async (payload: {
    paymentId: string;
    userId: number;
    documentId: number;
    type: string
    destination?: string;
    email?: string;
}) => {
    const { data } = await http.post("/request", payload);
    return data;
}

export const getRequests = async (params: { page?: number, limit?: number }): Promise<PaginatedResponse<Request>> => {
    const { data } = await http.get(`/request?${params}`);
    return data;
}


export const getRequestsByUser = async (userId: number): Promise<PaginatedResponse<Request>> => {
    const { data } = await http.get(`/request/user/${userId}`);
    return data;
}

export const getRequestById = async (id: number) => {
    const { data } = await http.get(`/request/${id}`);
    return data;
}

export const getRequestByAdmin = async (id: number) => {
    const { data } = await http.get(`/request/admin/${id}`);
    return data;
}

export const getPendingRequests = async (userId: number): Promise<PaginatedResponse<Request>> => {
    const { data } = await http.get(`/request/pending/${userId}`);
    return data;
}
export const submitApproval = async (userId: number): Promise<PaginatedResponse<Request>> => {
    const { data } = await http.get(`/request/pending/${userId}`);
    return data;
}


/*
==========================
Combo
==========================
*/

export interface Combo {
    id: number;
    name: string;
    email: string;
    matric_number: string;
    certNo: string;
    type: string;
    year: string;
    remark: string;
    session: string;
    print_date: string;
    createdBy: {
        id: number;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateComboPayload {
    name: string;
    email: string;
    matric_number: string;
    certNo: string;
    type: string;
    year: string;
    remark: string;
    session: string;
    print_date: string;
}

export type UpdateComboPayload = Partial<CreateComboPayload>;


export const createCombo = async (payload: CreateComboPayload) => {
    const { data } = await http.post('/combos', payload);
    return data;
};

export const getCombos = async (params: Record<string, any> | string): Promise<PaginatedResponse<Combo>> => {
    const queryString = typeof params === 'string' ? params : new URLSearchParams(params).toString();
    const { data } = await http.get(`/combos?${queryString}`);
    return data;
};

export const getCombo = async (id: number) => {
    const { data } = await http.get(`/combos/${id}`);
    return data;
};

export const updateCombo = async (id: number, payload: UpdateComboPayload) => {
    const { data } = await http.patch(`/combos/${id}`, payload);
    return data;
};

export const deleteCombo = async (id: number) => {
    const { data } = await http.delete(`/combos/${id}`);
    return data;
};

export const deleteCombosByYear = async (year: string) => {
    const { data } = await http.delete(`/combos/year/${year}`);
    return data;
};

export const uploadComboFile = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('adminId', id.toString());
    const { data } = await http.post('/combos/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const checkPrintStatus = async (matric: string) => {
    const { data } = await http.get(`/combos/check`, {
        params: { matric }
    });
    return data;
};


/*
==========================
Payments
==========================
*/
export interface Payment {
    id: string
    email: string
    status: string
    reference: string
    transaction_id: string
    totalAmount: number
    user: {
        id: number
        matric_number: string
        email: string
    }
    createdAt: string

}

export const getPayments = async (params: string): Promise<PaginatedResponse<Payment>> => {
    const { data } = await http.get(`/payment?${params}`);
    return data;
}

export const getPaymentsByUser = async (userId: number): Promise<PaginatedResponse<Payment>> => {
    const { data } = await http.get(`/payment/user/${userId}`);
    return data;
}

export const initPayment = async (payload: {
    request: string;
    type?: string;
    destination?: string;
    price: number;
    processing_fee: number;
    document?: any;
    user: any;
}) => {
    const { data } = await http.post("/payment/init", payload);
    return data;
};

export const updatePayment = async (
    id: number,
    payload: Partial<{
        transaction_id: string;
        reference: string;
        access_code: string;
        gateway_response: any;
        status: string;
        email: string;
    }>
) => {
    const { data } = await http.patch(`/payment/${id}`, payload);
    return data;
};


/*
==========================
Approval Chain
==========================
*/

export interface Chain {
    id: number
    name: string
    description?: string
    createdById: number
    isActive: boolean
    createdAt: string
    steps: {
        id: number
        name: string
        stepOrder: number
        description?: string
        roleId?: number
        userId?: number
        canReject: boolean
    }[]
}

export const getChains = async (params: string): Promise<PaginatedResponse<Chain>> => {
    const { data } = await http.get(`/approval-chains?${params}`);
    return data;
}
export const createChain = async (payload: {
    createdById: number
    name: string
    description?: string
    steps: {
        stepOrder: number
        name: string
        description?: string
        roleId?: number
        userId?: number
    }[]
}) => {
    const { data } = await http.post('/approval-chains', payload)
    return data
}

export const updateChain = async (id: number, payload: {
    createdById: number
    name: string
    description?: string
    steps: {
        stepOrder: number
        name: string
        description?: string
        roleId?: number
        userId?: number
    }[]
}) => {
    const response = await http.patch(`/approval-chains/${id}`, payload)
    return response.data
}

export const deleteChain = async (id: number) => {
    try {
        const response = await http.delete(`/approval-chains/${id}`);
        return response.data;
    } catch (error) {
        console.error('An Error Occoured: ', error)
    }
}

/*
==========================
Approval
==========================
*/

export interface Approval {
    id: number
    adminId: number
    requestId: number
    stepId: number
    action: string
    comment: String
}

export const getApprovals = async (params: string): Promise<PaginatedResponse<Approval>> => {
    const { data } = await http.get(`/approvals?${params}`);
    return data;
}
export const createApproval = async (payload: {
    adminId: number
    requestId: number
    stepId: number
    action: string
    comment: String
}) => {
    const { data } = await http.post('/approvals', payload)
    return data
}


/*
==========================
Approval
==========================
*/

export interface Activity {
    id: number
    action: string
    description: string
    actorType: number
    actor: string
}

export const getActivities = async (params: string): Promise<PaginatedResponse<Activity>> => {
    const { data } = await http.get(`/activity?${params}`);
    return data;
}

export interface Template {
    id: number
    name: string
    content?: string
    logo?: string

    createdBy: number

    creator: {
        id: number
        firstname: string
        lastname: string
        email: string
    }

    users?: {
        id: number
        firstname: string
        lastname: string
        email: string
    }[]

    createdAt: string
    updatedAt: string
}

export const createTemplate = async (payload: {
    name: string
    content?: string
    logo?: string
    createdBy: number
}) => {
    const { data } = await http.post('/template', payload)
    return data
}

export const getTemplates = async (
    param?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Template>> => {
    const { data } = await http.get('/template', {
        params: {
            page: param?.page,
            limit: param?.limit,
        },
    });

    return data;
};

export const updateTemplate = async (id: number, payload: {
    name?: string
    content?: string
    logo?: string
}) => {
    const { data } = await http.patch(`/template/${id}`, payload)
    return data
}

export const deleteTemplate = async (id: number) => {
    const { data } = await http.delete(`/template/${id}`);
    return data;
}
